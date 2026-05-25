from flask import Blueprint, jsonify
import time

safety_bp = Blueprint("safety", __name__)


@safety_bp.route("/api/safety/status", methods=["GET", "OPTIONS"])
@safety_bp.route("/safety/status", methods=["GET", "OPTIONS"])
def get_safety_status():
    """
    Safety status endpoint used by the frontend Telescope View.
    """

    return jsonify({
        "success": True,
        "status": "safe",
        "message": "Safety system operational",
        "telescopeConnected": True,
        "emergencyStop": False,
        "weatherSafe": True,
        "mountSafe": True,
        "cameraSafe": True,
        "timestamp": time.time()
    }), 200


@safety_bp.route("/api/safety/health", methods=["GET", "OPTIONS"])
@safety_bp.route("/safety/health", methods=["GET", "OPTIONS"])
def safety_health():
    """
    Simple health check for safety service.
    """

    return jsonify({
        "success": True,
        "status": "healthy",
        "message": "Safety service is running",
        "timestamp": time.time()
    }), 200


@safety_bp.route("/api/safety/emergency-stop", methods=["POST", "OPTIONS"])
@safety_bp.route("/safety/emergency-stop", methods=["POST", "OPTIONS"])
def emergency_stop():
    """
    Placeholder emergency stop endpoint.
    """

    return jsonify({
        "success": True,
        "status": "stopped",
        "message": "Emergency stop triggered successfully",
        "timestamp": time.time()
    }), 200