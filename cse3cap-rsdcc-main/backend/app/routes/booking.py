from flask import Blueprint, request, jsonify

booking_bp = Blueprint("booking", __name__, url_prefix="/api/booking")

# Temporary in-memory storage
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

    booking = {
        "id": len(bookings) + 1,
        "name": name,
        "date": date,
        "time": time
    }

    bookings.append(booking)

    return jsonify({
        "message": "Booking created",
        "booking": booking
    }), 201