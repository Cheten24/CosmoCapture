from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not email:
        return jsonify({"error": "Email is required"}), 400

    if "@" not in email or "." not in email:
        return jsonify({"error": "Invalid email format"}), 400

    return jsonify({
        "message": "Login successful",
        "user": {
            "name": name,
            "email": email
        }
    }), 200