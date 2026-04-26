from flask import Blueprint, request, jsonify

booking_bp = Blueprint("booking", __name__, url_prefix="/api/booking")

bookings = []

@booking_bp.route("", methods=["POST"])
def create_booking():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    date = (data.get("date") or "").strip()
    time = (data.get("time") or "").strip()

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not date:
        return jsonify({"error": "Date is required"}), 400

    if not time:
        return jsonify({"error": "Time is required"}), 400

    # Check existing bookings for same slot
    same_slot = [b for b in bookings if b["date"] == date and b["time"] == time]

    if len(same_slot) == 0:
        status = "confirmed"
        queue_position = 0
    else:
        status = "queued"
        queue_position = len(same_slot)

    booking = {
        "id": len(bookings) + 1,
        "name": name,
        "date": date,
        "time": time,
        "status": status,
        "queuePosition": queue_position
    }

    bookings.append(booking)

    return jsonify({
        "message": "Booking processed",
        "booking": booking
    }), 201

@booking_bp.route("", methods=["GET"])
def list_bookings():
    return jsonify({
        "items": bookings,
        "total": len(bookings)
    }), 200