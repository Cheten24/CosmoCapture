from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True
)

@app.route("/")
def home():
    return "Backend Working"

@app.route("/api/auth/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    data = request.get_json()

    username = data.get("name")
    email = data.get("email")

    if not username or not email:
        return jsonify({
            "success": False,
            "error": "Missing username or email"
        }), 400

    return jsonify({
        "success": True,
        "message": f"Welcome {username}"
    }), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)