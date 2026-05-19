# app/weather.py
# Routes for fetching live weather data from Open-Meteo.

from flask import Blueprint, jsonify
import requests

weather_bp = Blueprint("weather", __name__, url_prefix="/weather")

# Melbourne coordinates
# Change these later if your telescope is in a different location.
LATITUDE = -37.8136
LONGITUDE = 144.9631

@weather_bp.route("/current", methods=["GET"])
def get_current_weather():
    """
    Fetch current live weather data from Open-Meteo.
    Used by the Weather Monitoring page and booking validation.
    """
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={LATITUDE}"
            f"&longitude={LONGITUDE}"
            "&current=temperature_2m,relative_humidity_2m,dew_point_2m,"
            "pressure_msl,cloud_cover,wind_speed_10m,precipitation"
            "&timezone=Australia%2FMelbourne"
        )

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()
        current = data.get("current", {})

        weather_data = {
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "dewPoint": current.get("dew_point_2m"),
            "pressure": current.get("pressure_msl"),
            "cloudCover": current.get("cloud_cover"),
            "windSpeed": current.get("wind_speed_10m"),
            "precipitation": current.get("precipitation"),
            "time": current.get("time"),
            "source": "Open-Meteo",
        }

        return jsonify(weather_data), 200

    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data from Open-Meteo: {e}")
        return jsonify({
            "error": "Failed to fetch weather data from Open-Meteo"
        }), 503


@weather_bp.route("/observation-conditions", methods=["GET"])
def get_observation_conditions():
    """
    Checks if weather conditions are suitable for telescope observation.
    This can be used by the booking page.
    """
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={LATITUDE}"
            f"&longitude={LONGITUDE}"
            "&current=temperature_2m,relative_humidity_2m,dew_point_2m,"
            "pressure_msl,cloud_cover,wind_speed_10m,precipitation"
            "&timezone=Australia%2FMelbourne"
        )

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()
        current = data.get("current", {})

        cloud_cover = current.get("cloud_cover", 100)
        wind_speed = current.get("wind_speed_10m", 999)
        precipitation = current.get("precipitation", 999)
        humidity = current.get("relative_humidity_2m", 100)

        suitable = (
            cloud_cover <= 40
            and wind_speed <= 20
            and precipitation == 0
            and humidity <= 85
        )

        reasons = []

        if cloud_cover > 40:
            reasons.append("Cloud cover is too high")

        if wind_speed > 20:
            reasons.append("Wind speed is too high")

        if precipitation > 0:
            reasons.append("Rain or precipitation detected")

        if humidity > 85:
            reasons.append("Humidity is too high")

        return jsonify({
            "suitable": suitable,
            "message": "Weather conditions are suitable for observation"
            if suitable else "Weather conditions are not suitable for observation",
            "reasons": reasons,
            "conditions": {
                "temperature": current.get("temperature_2m"),
                "humidity": humidity,
                "dewPoint": current.get("dew_point_2m"),
                "pressure": current.get("pressure_msl"),
                "cloudCover": cloud_cover,
                "windSpeed": wind_speed,
                "precipitation": precipitation,
                "time": current.get("time"),
            },
            "source": "Open-Meteo",
        }), 200

    except requests.exceptions.RequestException as e:
        print(f"Error checking observation conditions: {e}")
        return jsonify({
            "error": "Failed to check observation conditions"
        }), 503