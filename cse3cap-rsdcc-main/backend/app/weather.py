import os
import requests
from flask import Blueprint, jsonify

weather_bp = Blueprint("weather", __name__, url_prefix="/weather")

# Melbourne coordinates
LATITUDE = -37.8136
LONGITUDE = 144.9631

# Optional ThingSpeak config
THINGSPEAK_API_BASE_URL = os.getenv(
    "THINGSPEAK_API_BASE_URL",
    "https://api.thingspeak.com"
)
THINGSPEAK_CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID", "270748")


def build_open_meteo_url():
    return (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={LATITUDE}"
        f"&longitude={LONGITUDE}"
        "&current=temperature_2m,relative_humidity_2m,dew_point_2m,"
        "pressure_msl,cloud_cover,wind_speed_10m,precipitation,"
        "surface_pressure"
        "&timezone=Australia%2FMelbourne"
    )


def fetch_open_meteo_weather():
    response = requests.get(build_open_meteo_url(), timeout=10)
    response.raise_for_status()

    data = response.json()
    current = data.get("current", {})

    temperature = current.get("temperature_2m")
    humidity = current.get("relative_humidity_2m")
    dew_point = current.get("dew_point_2m")
    pressure = current.get("pressure_msl") or current.get("surface_pressure")
    cloud_cover = current.get("cloud_cover")
    wind_speed = current.get("wind_speed_10m")
    precipitation = current.get("precipitation")

    return {
        "status": "success",
        "provider": "Open-Meteo",
        "source": "Open-Meteo",
        "latitude": LATITUDE,
        "longitude": LONGITUDE,

        # Names for frontend display
        "temperature": temperature,
        "humidity": humidity,
        "dewPoint": dew_point,
        "pressure": pressure,
        "cloudCover": cloud_cover,
        "windSpeed": wind_speed,
        "precipitation": precipitation,

        # Names for backend/other components
        "temperature_2m": temperature,
        "relative_humidity_2m": humidity,
        "dew_point_2m": dew_point,
        "pressure_msl": pressure,
        "surface_pressure": pressure,
        "cloud_cover": cloud_cover,
        "wind_speed_10m": wind_speed,

        # Status labels for weather page
        "skyClarity": "Excellent"
        if cloud_cover is not None and cloud_cover <= 25
        else "Moderate",
        "seeingConditions": "Good"
        if wind_speed is not None and wind_speed <= 20
        else "Poor",
        "cloudCoverStatus": "Minimal"
        if cloud_cover is not None and cloud_cover <= 25
        else "High",
        "windSpeedStatus": "Low"
        if wind_speed is not None and wind_speed <= 20
        else "High",
    }


def get_feeds_endpoint():
    return (
        f"{THINGSPEAK_API_BASE_URL}/channels/"
        f"{THINGSPEAK_CHANNEL_ID}/feeds.json?results=10"
    )


@weather_bp.route("/", methods=["GET"])
@weather_bp.route("", methods=["GET"])
@weather_bp.route("/current", methods=["GET"])
@weather_bp.route("/api/weather", methods=["GET"])
def get_current_weather():
    """
    Fetch current live weather data from Open-Meteo.
    Used by weather monitoring page and booking validation.
    """
    try:
        return jsonify(fetch_open_meteo_weather()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch live weather from Open-Meteo",
            "error": str(e)
        }), 503


@weather_bp.route("/observation-conditions", methods=["GET"])
def get_observation_conditions():
    """
    Checks if weather conditions are suitable for telescope observation.
    Used by booking page validation.
    """
    try:
        weather_data = fetch_open_meteo_weather()

        cloud_cover = weather_data.get("cloudCover", 100)
        wind_speed = weather_data.get("windSpeed", 999)
        precipitation = weather_data.get("precipitation", 999)
        humidity = weather_data.get("humidity", 100)

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
            if suitable
            else "Weather conditions are not suitable for observation",
            "reasons": reasons,
            "conditions": weather_data,
            "source": "Open-Meteo"
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "message": "Failed to check observation conditions",
            "error": str(e)
        }), 503


@weather_bp.route("/feeds", methods=["GET"])
def get_weather_feeds():
    """
    Optional old ThingSpeak endpoint.
    Kept so existing frontend pages do not break.
    """
    try:
        response = requests.get(get_feeds_endpoint(), timeout=8)
        response.raise_for_status()
        return jsonify(response.json()), 200

    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch feed data from ThingSpeak API",
            "error": str(e)
        }), 503


print("WEATHER BP LOADED")