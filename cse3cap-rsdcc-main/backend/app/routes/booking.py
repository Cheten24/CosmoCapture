from flask import Blueprint, request, jsonify

booking_bp = Blueprint("booking", __name__, url_prefix="/api/booking")

bookings = []
queue = []

@booking_bp.route("", methods=["POST"])
def create_booking():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    date = (data.get("date") or "").strip()
    time = (data.get("time") or "").strip()
    object_name = (data.get("objectName") or "").strip()

    if not date:
        return jsonify({"error": "Date is required"}), 400

    if not time:
        return jsonify({"error": "Time is required"}), 400

    same_slot = [b for b in bookings if b["date"] == date and b["time"] == time]

    if len(same_slot) == 0:
        status = "confirmed"
        queue_position = 0
    else:
        status = "queued"
        queue_position = len(same_slot)

    booking = {
        "id": len(bookings) + 1,
        "name": name or "Student",
        "date": date,
        "time": time,
        "objectName": object_name,
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


@booking_bp.route("/queue", methods=["GET"])
def get_queue():
    return jsonify({
        "queueLength": len(queue),
        "estimatedWait": len(queue) * 15
    })


@booking_bp.route("/queue/join", methods=["POST"])
def join_queue():
    queue.append("user")

    return jsonify({
        "message": "Joined queue successfully",
        "queueLength": len(queue),
        "estimatedWait": len(queue) * 15
    })