from flask import Blueprint, request, jsonify
from datetime import datetime

booking_bp = Blueprint("booking", __name__, url_prefix="/api/booking")

# Temporary storage (later replace with database)
bookings = []


@booking_bp.route("", methods=["POST"])
def create_booking():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    date = (data.get("date") or "").strip()
    time = (data.get("time") or "").strip()
    object_name = (data.get("object") or "").strip()

    # ✅ Validation
    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not date:
        return jsonify({"error": "Date is required"}), 400

    if not time:
        return jsonify({"error": "Time is required"}), 400

    if not object_name:
        return jsonify({"error": "Object is required"}), 400

    # ✅ Format validation
    try:
        booking_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format (YYYY-MM-DD)"}), 400

    try:
        booking_time = datetime.strptime(time, "%H:%M")
    except ValueError:
        return jsonify({"error": "Invalid time format (HH:MM)"}), 400

    # ✅ Combine date + time
    booking_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")

    #  Prevent past booking
    if booking_datetime < datetime.now():
        return jsonify({"error": "Cannot book past time"}), 400

    #  Prevent duplicate booking (same user same slot)
    if any(
        b["name"] == name and b["date"] == date and b["time"] == time
        for b in bookings
    ):
        return jsonify({
            "status": "error",
            "message": "You already booked this slot"
        }), 400

    #  Queue logic
    same_slot = [b for b in bookings if b["date"] == date and b["time"] == time]

    queue_position = len(same_slot)

    if queue_position == 0:
        status = "confirmed"
        queue_position = 0
    message = "Booking confirmed"
    else:
        status = "queued"
        queue_position = len(same_slot) + 1
        message = f"Slot already booked. You are number {queue_position} in the queue"

    # Estimated wait (simple logic)
    estimated_wait = queue_position * 30  # minutes

    # ✅ Create booking
    booking = {
        "id": len(bookings) + 1,
        "name": name,
        "date": date,
        "time": time,
        "object": object_name,
        "status": status,
        "queuePosition": queue_position,
        "estimatedWait": f"{estimated_wait} minutes",
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
        "items": bookings,
        "total": len(bookings)
    }), 200


@booking_bp.route("/<int:booking_id>", methods=["GET"])
def get_booking(booking_id):
    booking = next((b for b in bookings if b["id"] == booking_id), None)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    return jsonify(booking), 200


@booking_bp.route("/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    global bookings

    booking = next((b for b in bookings if b["id"] == booking_id), None)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    bookings = [b for b in bookings if b["id"] != booking_id]

    return jsonify({"message": "Booking deleted"}), 200