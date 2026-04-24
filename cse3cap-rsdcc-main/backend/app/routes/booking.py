from flask import Blueprint, request, jsonify

booking_bp = Blueprint("booking", __name__, url_prefix="/api")

queue = []

@booking_bp.route("/bookings", methods=["POST"])
def create_booking():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    booking = {
        "date": data.get("date"),
        "time": data.get("time"),
        "objectName": data.get("objectName"),
    }

    return jsonify({
        "message": "Booking created successfully",
        "booking": booking
    }), 201


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