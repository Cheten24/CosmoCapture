from flask import Blueprint, request, jsonify
from datetime import datetime
import os
import requests

booking_bp = Blueprint("booking", __name__, url_prefix="/api/booking")

bookings = []
queue = []


def check_weather_safety():
    """
    Live weather safety check using ThingSpeak.
    For demo testing, humidity is only blocked if it is above 100.
    """
    base_url = os.getenv("THINGSPEAK_API_BASE_URL", "https://api.thingspeak.com")
    channel_id = os.getenv("THINGSPEAK_CHANNEL_ID", "270748")
    endpoint = f"{base_url}/channels/{channel_id}/feeds.json?results=1"

    try:
        response = requests.get(endpoint, timeout=5)
        response.raise_for_status()
        data = response.json()

        feeds = data.get("feeds", [])
        if not feeds:
            return {"safe": False, "reason": "No live weather data available"}

        latest = feeds[-1]

        temperature = float(latest.get("field1") or 0)
        humidity = float(latest.get("field2") or 0)
        pressure = float(latest.get("field3") or 0)
        dew_point = float(latest.get("field4") or 0)

        unsafe_reasons = []

        if humidity > 100:
            unsafe_reasons.append("humidity is too high")

        if temperature < -5 or temperature > 40:
            unsafe_reasons.append("temperature is outside safe range")

        if pressure < 950 or pressure > 1050:
            unsafe_reasons.append("pressure is outside safe range")

        if dew_point > 20:
            unsafe_reasons.append("dew point is too high")

        if unsafe_reasons:
            return {
                "safe": False,
                "reason": "Unsafe weather: " + ", ".join(unsafe_reasons),
                "temperature": temperature,
                "humidity": humidity,
                "pressure": pressure,
                "dewPoint": dew_point
            }

        return {
            "safe": True,
            "reason": "Live weather conditions are safe for booking",
            "temperature": temperature,
            "humidity": humidity,
            "pressure": pressure,
            "dewPoint": dew_point
        }

    except Exception as e:
        return {
            "safe": False,
            "reason": f"Could not verify live weather data: {str(e)}"
        }


def get_visible_objects_for_time(date, time, latitude, longitude):
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

    weather_check = check_weather_safety()
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
        "temperature": weather_check.get("temperature"),
        "humidity": weather_check.get("humidity"),
        "pressure": weather_check.get("pressure"),
        "dewPoint": weather_check.get("dewPoint"),
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