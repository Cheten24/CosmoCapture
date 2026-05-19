from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Enable CORS for frontend
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True
)

# Home route
@app.route("/")
def home():
    return "Backend Working"


# Login route
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


# Weather API route
@app.route("/api/weather", methods=["GET"])
def get_weather():

    api_key = os.getenv("WEATHER_API_KEY")

    if not api_key:
        return jsonify({
            "success": False,
            "error": "Weather API key missing"
        }), 500

    city = "Melbourne"

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={api_key}&units=metric"
    )

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
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# Run Flask server
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)