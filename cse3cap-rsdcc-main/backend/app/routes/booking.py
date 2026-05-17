from flask import Blueprint, request, jsonify
from datetime import datetime
import requests

booking_bp = Blueprint("booking", __name__, url_prefix="/api/booking")

bookings = []
queue = []


def check_weather_safety(latitude="-37.8136", longitude="144.9631"):
    """
    Real weather safety check using Open-Meteo.
    Uses GPS coordinates to check current weather before confirming booking.
    """
    endpoint = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}"
        f"&longitude={longitude}"
        "&current=temperature_2m,relative_humidity_2m,cloud_cover,precipitation,wind_speed_10m"
    )

    try:
        response = requests.get(endpoint, timeout=5)
        response.raise_for_status()
        data = response.json()

        current = data.get("current", {})

        temperature = current.get("temperature_2m")
        humidity = current.get("relative_humidity_2m")
        cloud_cover = current.get("cloud_cover")
        precipitation = current.get("precipitation")
        wind_speed = current.get("wind_speed_10m")

        unsafe_reasons = []

        if humidity is not None and humidity > 90:
            unsafe_reasons.append("humidity is too high")

        if cloud_cover is not None and cloud_cover > 80:
            unsafe_reasons.append("cloud cover is too high")

        if precipitation is not None and precipitation > 0:
            unsafe_reasons.append("rain/precipitation detected")

        if wind_speed is not None and wind_speed > 35:
            unsafe_reasons.append("wind speed is too high")

        if temperature is not None and (temperature < -5 or temperature > 40):
            unsafe_reasons.append("temperature is outside safe range")

        if unsafe_reasons:
            return {
                "safe": False,
                "reason": "Unsafe weather: " + ", ".join(unsafe_reasons),
                "temperature": temperature,
                "humidity": humidity,
                "cloudCover": cloud_cover,
                "precipitation": precipitation,
                "windSpeed": wind_speed,
                "provider": "Open-Meteo"
            }

        return {
            "safe": True,
            "reason": "Open-Meteo weather conditions are safe for booking",
            "temperature": temperature,
            "humidity": humidity,
            "cloudCover": cloud_cover,
            "precipitation": precipitation,
            "windSpeed": wind_speed,
            "provider": "Open-Meteo"
        }

    except Exception as e:
        return {
            "safe": False,
            "reason": f"Could not verify weather data from Open-Meteo: {str(e)}",
            "provider": "Open-Meteo"
        }


def get_visible_objects_for_time(date, time, latitude, longitude):
    """
    Temporary object availability logic.
    Uses booking date/time and GPS coordinates.
    Later this can be upgraded with Skyfield or a real astronomy database.
    """
    hour = int(time.split(":")[0])

    if 18 <= hour or hour <= 5:
        objects = ["Moon", "Mars", "Jupiter", "Saturn", "Orion Nebula"]
    else:
        objects = ["Sun"]

    return {
        "date": date,
        "time": time,
        "latitude": latitude,
        "longitude": longitude,
        "objects": objects
    }


def check_object_visibility(object_name, date, time, latitude, longitude):
    """
    Checks whether the selected object is available for the chosen booking time/location.
    """
    availability = get_visible_objects_for_time(date, time, latitude, longitude)
    visible_objects = availability["objects"]

    if object_name.lower() not in [obj.lower() for obj in visible_objects]:
        return {
            "visible": False,
            "reason": f"{object_name} is not visible at {time} for the selected location",
            "availableObjects": visible_objects
        }

    return {
        "visible": True,
        "reason": f"{object_name} is visible at {time} for the selected location",
        "availableObjects": visible_objects
    }


@booking_bp.route("/available-objects", methods=["GET"])
def available_objects():
    date = (request.args.get("date") or "").strip()
    time = (request.args.get("time") or "").strip()
    latitude = request.args.get("lat") or "-37.8136"
    longitude = request.args.get("lng") or "144.9631"

    if not date:
        return jsonify({"status": "error", "message": "Date is required"}), 400

    if not time:
        return jsonify({"status": "error", "message": "Time is required"}), 400

    try:
        datetime.strptime(date, "%Y-%m-%d")
        datetime.strptime(time, "%H:%M")
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid date or time format"}), 400

    availability = get_visible_objects_for_time(date, time, latitude, longitude)

    return jsonify({
        "status": "success",
        "message": "Available objects loaded",
        "date": date,
        "time": time,
        "latitude": latitude,
        "longitude": longitude,
        "objects": availability["objects"]
    }), 200


@booking_bp.route("", methods=["POST"])
def create_booking():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "Student").strip()
    date = (data.get("date") or "").strip()
    time = (data.get("time") or "").strip()
    object_name = (data.get("objectName") or data.get("object") or "").strip()
    latitude = str(data.get("lat") or data.get("latitude") or "-37.8136")
    longitude = str(data.get("lng") or data.get("longitude") or "144.9631")

    if not date:
        return jsonify({"status": "error", "message": "Date is required"}), 400

    if not time:
        return jsonify({"status": "error", "message": "Time is required"}), 400

    if not object_name:
        return jsonify({"status": "error", "message": "Object is required"}), 400

    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid date format (YYYY-MM-DD)"}), 400

    try:
        datetime.strptime(time, "%H:%M")
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid time format (HH:MM)"}), 400

    booking_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")

    if booking_datetime < datetime.now():
        return jsonify({"status": "error", "message": "Cannot book past time"}), 400

    weather_check = check_weather_safety(latitude, longitude)
    if not weather_check["safe"]:
        return jsonify({
            "status": "rejected",
            "message": "Booking rejected",
            "reason": weather_check["reason"],
            "weather": weather_check
        }), 400

    visibility_check = check_object_visibility(object_name, date, time, latitude, longitude)
    if not visibility_check["visible"]:
        return jsonify({
            "status": "rejected",
            "message": "Booking rejected",
            "reason": visibility_check["reason"],
            "availableObjects": visibility_check["availableObjects"]
        }), 400

    same_slot = [b for b in bookings if b["date"] == date and b["time"] == time]

    if len(same_slot) == 0:
        status = "confirmed"
        queue_position = 0
        message = "Booking confirmed"
    else:
        status = "queued"
        queue_position = len(same_slot) + 1
        message = f"Slot already booked. You are number {queue_position} in the queue"

    booking = {
        "id": len(bookings) + 1,
        "name": name,
        "date": date,
        "time": time,
        "latitude": latitude,
        "longitude": longitude,
        "objectName": object_name,
        "object": object_name,
        "status": status,
        "queuePosition": queue_position,
        "estimatedWait": f"{queue_position * 30} minutes",
        "weatherSafe": weather_check["safe"],
        "weatherReason": weather_check["reason"],
        "weatherProvider": weather_check.get("provider"),
        "temperature": weather_check.get("temperature"),
        "humidity": weather_check.get("humidity"),
        "cloudCover": weather_check.get("cloudCover"),
        "precipitation": weather_check.get("precipitation"),
        "windSpeed": weather_check.get("windSpeed"),
        "objectVisible": visibility_check["visible"],
        "visibilityReason": visibility_check["reason"],
        "availableObjects": visibility_check["availableObjects"],
        "createdAt": datetime.now().isoformat()
    }

    bookings.append(booking)

    return jsonify({
        "status": "success",
        "message": message,
        "booking": booking
    }), 201


@booking_bp.route("", methods=["GET"])
def list_bookings():
    return jsonify({
        "status": "success",
        "items": bookings,
        "total": len(bookings)
    }), 200


@booking_bp.route("/queue", methods=["GET"])
def get_queue():
    return jsonify({
        "queueLength": len(queue),
        "estimatedWait": len(queue) * 15
    }), 200


@booking_bp.route("/queue/join", methods=["POST"])
def join_queue():
    queue.append("user")

    return jsonify({
        "message": "Joined queue successfully",
        "queueLength": len(queue),
        "estimatedWait": len(queue) * 15
    }), 200


@booking_bp.route("/<int:booking_id>", methods=["GET"])
def get_booking(booking_id):
    booking = next((b for b in bookings if b["id"] == booking_id), None)

    if not booking:
        return jsonify({"status": "error", "message": "Booking not found"}), 404

    return jsonify({
        "status": "success",
        "booking": booking
    }), 200


@booking_bp.route("/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    global bookings

    booking = next((b for b in bookings if b["id"] == booking_id), None)

    if not booking:
        return jsonify({"status": "error", "message": "Booking not found"}), 404

    bookings = [b for b in bookings if b["id"] != booking_id]

    return jsonify({
        "status": "success",
        "message": "Booking deleted",
        "booking": booking
    }), 200