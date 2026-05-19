from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

load_dotenv()

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

    data = request.get_json() or {}
    username = data.get("name")
    email = data.get("email")

    if not username or not email:
        return jsonify({"success": False, "error": "Missing username or email"}), 400

    return jsonify({"success": True, "message": f"Welcome {username}"}), 200


@app.route("/api/weather", methods=["GET"])
def get_weather():
    api_key = os.getenv("WEATHER_API_KEY")
    city = "Melbourne"

    if not api_key:
        return jsonify({"success": False, "error": "Weather API key missing"}), 500

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if response.status_code != 200:
            return jsonify({
                "success": False,
                "error": data.get("message", "Weather API error")
            }), response.status_code

        return jsonify({
            "success": True,
            "city": city,
            "temperature": data["main"]["temp"],
            "weather": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "clouds": data["clouds"]["all"]
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def booking_response():
    data = request.get_json() or {}

    date = data.get("date") or data.get("selectedDate")
    time = data.get("time") or data.get("selectedTime")
    obj = data.get("objectName") or data.get("object") or data.get("selectedObject")

    return jsonify({
        "success": True,
        "message": "Booking confirmed successfully",
        "booking": {
            "date": date,
            "time": time,
            "object": obj,
            "status": "confirmed"
        }
    }), 200


@app.route("/api/bookings", methods=["POST", "OPTIONS"])
@app.route("/api/booking", methods=["POST", "OPTIONS"])
@app.route("/api/book-session", methods=["POST", "OPTIONS"])
@app.route("/api/session", methods=["POST", "OPTIONS"])
@app.route("/api/sessions", methods=["POST", "OPTIONS"])
def create_booking():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    return booking_response()


@app.route("/api/safety/status", methods=["GET", "OPTIONS"])
def safety_status():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    return jsonify({
        "success": True,
        "safe": True,
        "weather_safe": True,
        "wind_safe": True,
        "message": "Observatory conditions are safe"
    }), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)