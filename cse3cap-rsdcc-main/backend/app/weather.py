import os
from flask import Blueprint, jsonify
import requests

weather_bp = Blueprint("weather", __name__)

DEFAULT_LATITUDE = "-37.8136"
DEFAULT_LONGITUDE = "144.9631"

THINGSPEAK_API_BASE_URL = os.getenv(
    "THINGSPEAK_API_BASE_URL",
    "https://api.thingspeak.com"
)
THINGSPEAK_CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID", "270748")

get_feeds_endpoint = (
    f"{THINGSPEAK_API_BASE_URL}/channels/"
    f"{THINGSPEAK_CHANNEL_ID}/feeds.json?results=10"
)


def fetch_open_meteo_weather():
    endpoint = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={DEFAULT_LATITUDE}"
        f"&longitude={DEFAULT_LONGITUDE}"
        "&current=temperature_2m,relative_humidity_2m,cloud_cover,"
        "precipitation,wind_speed_10m,surface_pressure"
    )

    response = requests.get(endpoint, timeout=8)
    response.raise_for_status()

    data = response.json()
    current = data.get("current", {})

    temperature = current.get("temperature_2m")
    humidity = current.get("relative_humidity_2m")
    cloud_cover = current.get("cloud_cover")
    precipitation = current.get("precipitation")
    wind_speed = current.get("wind_speed_10m")
    pressure = current.get("surface_pressure")

    return {
        "status": "success",
        "provider": "Open-Meteo",
        "latitude": DEFAULT_LATITUDE,
        "longitude": DEFAULT_LONGITUDE,
        "temperature": temperature,
        "humidity": humidity,
        "cloudCover": cloud_cover,
        "precipitation": precipitation,
        "windSpeed": wind_speed,
        "pressure": pressure,
        "temperature_2m": temperature,
        "relative_humidity_2m": humidity,
        "cloud_cover": cloud_cover,
        "wind_speed_10m": wind_speed,
        "surface_pressure": pressure,
        "skyClarity": "Excellent" if cloud_cover is not None and cloud_cover <= 25 else "Moderate",
        "seeingConditions": "Good" if wind_speed is not None and wind_speed <= 20 else "Poor",
        "cloudCoverStatus": "Minimal" if cloud_cover is not None and cloud_cover <= 25 else "High",
        "windSpeedStatus": "Low" if wind_speed is not None and wind_speed <= 20 else "High"
    }


@weather_bp.route("/api/weather", methods=["GET"])
@weather_bp.route("/api/weather/", methods=["GET"])
@weather_bp.route("/api/weather/current", methods=["GET"])
@weather_bp.route("/weather", methods=["GET"])
@weather_bp.route("/weather/", methods=["GET"])
def get_live_weather():
    try:
        return jsonify(fetch_open_meteo_weather()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch live weather from Open-Meteo",
            "error": str(e)
        }), 503


@weather_bp.route("/api/weather/feeds", methods=["GET"])
@weather_bp.route("/weather/feeds", methods=["GET"])
def get_weather_feeds():
    try:
        response = requests.get(get_feeds_endpoint, timeout=8)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch feed data from ThingSpeak API",
            "error": str(e)
        }), 503


print("WEATHER BP LOADED")