from flask import Blueprint, request, jsonify
from datetime import datetime

booking_bp = Blueprint("booking", __name__, url_prefix="/api/booking")

bookings = []
queue = []


@booking_bp.route("", methods=["POST"])
def create_booking():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "Student").strip()
    date = (data.get("date") or "").strip()
    time = (data.get("time") or "").strip()
    object_name = (data.get("objectName") or data.get("object") or "").strip()

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
        "objectName": object_name,
        "object": object_name,
        "status": status,
        "queuePosition": queue_position,
        "estimatedWait": f"{queue_position * 30} minutes",
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