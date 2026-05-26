import os
import requests
from flask import Blueprint, jsonify, request

# No url_prefix here.
# We define full routes manually so /api/weather and /weather both work.
weather_bp = Blueprint("weather", __name__)

# Default coordinates: Melbourne / La Trobe area
DEFAULT_LATITUDE = float(os.getenv("WEATHER_LAT", "-37.8136"))
DEFAULT_LONGITUDE = float(os.getenv("WEATHER_LON", "144.9631"))

# Optional old ThingSpeak config
THINGSPEAK_API_BASE_URL = os.getenv(
    "THINGSPEAK_API_BASE_URL",
    "https://api.thingspeak.com"
)
THINGSPEAK_CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID", "270748")


def get_coordinates():
    """
    Allows optional custom coordinates:
    /api/weather?lat=-37.8136&lon=144.9631
    """
    try:
        lat = float(request.args.get("lat", DEFAULT_LATITUDE))
        lon = float(request.args.get("lon", DEFAULT_LONGITUDE))
        return lat, lon
    except ValueError:
        return DEFAULT_LATITUDE, DEFAULT_LONGITUDE


def build_open_meteo_url(lat, lon):
    return (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}"
        f"&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,dew_point_2m,"
        "pressure_msl,surface_pressure,cloud_cover,wind_speed_10m,precipitation"
        "&timezone=Australia%2FMelbourne"
    )


def fetch_open_meteo_weather(lat, lon):
    response = requests.get(build_open_meteo_url(lat, lon), timeout=10)
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

    sky_clarity = "Excellent" if cloud_cover is not None and cloud_cover <= 25 else "Moderate"
    seeing_conditions = "Good" if wind_speed is not None and wind_speed <= 20 else "Poor"
    cloud_cover_status = "Minimal" if cloud_cover is not None and cloud_cover <= 25 else "High"
    wind_speed_status = "Low" if wind_speed is not None and wind_speed <= 20 else "High"

    return {
        "status": "success",
        "success": True,
        "provider": "Open-Meteo",
        "source": "Open-Meteo",
        "latitude": lat,
        "longitude": lon,

        # Frontend display fields
        "temperature": temperature,
        "humidity": humidity,
        "pressure": pressure,
        "dewPoint": dew_point,
        "cloudCover": cloud_cover,
        "windSpeed": wind_speed,
        "precipitation": precipitation,

        # Alternative field names for other components
        "temperature_2m": temperature,
        "relative_humidity_2m": humidity,
        "pressure_msl": pressure,
        "surface_pressure": pressure,
        "dew_point_2m": dew_point,
        "cloud_cover": cloud_cover,
        "wind_speed_10m": wind_speed,

        # Observation labels
        "skyClarity": sky_clarity,
        "seeingConditions": seeing_conditions,
        "cloudCoverStatus": cloud_cover_status,
        "windSpeedStatus": wind_speed_status,

        # Extra nested object in case frontend expects current data
        "current": {
            "temperature_2m": temperature,
            "relative_humidity_2m": humidity,
            "pressure_msl": pressure,
            "surface_pressure": pressure,
            "dew_point_2m": dew_point,
            "cloud_cover": cloud_cover,
            "wind_speed_10m": wind_speed,
            "precipitation": precipitation,
        }
    }


@weather_bp.route("/api/weather", methods=["GET"])
@weather_bp.route("/api/weather/current", methods=["GET"])
@weather_bp.route("/weather", methods=["GET"])
@weather_bp.route("/weather/", methods=["GET"])
@weather_bp.route("/weather/current", methods=["GET"])
def get_current_weather():
    """
    Live weather endpoint.
    Works with:
    /api/weather
    /weather
    /weather/current
    """
    lat, lon = get_coordinates()

    try:
        weather_data = fetch_open_meteo_weather(lat, lon)
        return jsonify(weather_data), 200

    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "success": False,
            "message": "Failed to fetch live weather from Open-Meteo",
            "error": str(e)
        }), 503

    except Exception as e:
        return jsonify({
            "status": "error",
            "success": False,
            "message": "Unexpected weather server error",
            "error": str(e)
        }), 500


@weather_bp.route("/api/weather/observation-conditions", methods=["GET"])
@weather_bp.route("/weather/observation-conditions", methods=["GET"])
def get_observation_conditions():
    """
    Checks if weather conditions are suitable for telescope observation.
    """
    lat, lon = get_coordinates()

    try:
        weather_data = fetch_open_meteo_weather(lat, lon)

        cloud_cover = weather_data.get("cloudCover")
        wind_speed = weather_data.get("windSpeed")
        precipitation = weather_data.get("precipitation")
        humidity = weather_data.get("humidity")

        cloud_cover = cloud_cover if cloud_cover is not None else 100
        wind_speed = wind_speed if wind_speed is not None else 999
        precipitation = precipitation if precipitation is not None else 999
        humidity = humidity if humidity is not None else 100

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
            "status": "success",
            "success": True,
            "suitable": suitable,
            "message": (
                "Weather conditions are suitable for observation"
                if suitable
                else "Weather conditions are not suitable for observation"
            ),
            "reasons": reasons,
            "conditions": weather_data,
            "source": "Open-Meteo"
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "success": False,
            "message": "Failed to check observation conditions",
            "error": str(e)
        }), 503

    except Exception as e:
        return jsonify({
            "status": "error",
            "success": False,
            "message": "Unexpected observation condition error",
            "error": str(e)
        }), 500


def get_feeds_endpoint():
    return (
        f"{THINGSPEAK_API_BASE_URL}/channels/"
        f"{THINGSPEAK_CHANNEL_ID}/feeds.json?results=10"
    )


@weather_bp.route("/api/weather/feeds", methods=["GET"])
@weather_bp.route("/weather/feeds", methods=["GET"])
def get_weather_feeds():
    """
    Optional old ThingSpeak endpoint.
    Kept so old frontend code does not break.
    """
    try:
        response = requests.get(get_feeds_endpoint(), timeout=8)
        response.raise_for_status()
        return jsonify(response.json()), 200

    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "success": False,
            "message": "Failed to fetch feed data from ThingSpeak API",
            "error": str(e)
        }), 503