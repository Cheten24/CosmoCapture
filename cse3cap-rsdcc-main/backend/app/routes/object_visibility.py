from flask import Blueprint, jsonify
from datetime import datetime

object_visibility_bp = Blueprint("object_visibility", __name__)

VISIBLE_OBJECTS = [
    {
        "id": 1,
        "name": "Moon",
        "type": "Natural Satellite",
        "visibility": "Excellent",
        "bestTime": "Now",
        "direction": "East",
        "description": "The Moon is currently one of the easiest objects to observe."
    },
    {
        "id": 2,
        "name": "Mars",
        "type": "Planet",
        "visibility": "Good",
        "bestTime": "Tonight",
        "direction": "West",
        "description": "Mars may be visible as a reddish point of light."
    },
    {
        "id": 3,
        "name": "Jupiter",
        "type": "Planet",
        "visibility": "Excellent",
        "bestTime": "Now",
        "direction": "South-East",
        "description": "Jupiter is bright and suitable for telescope viewing."
    },
    {
        "id": 4,
        "name": "Saturn",
        "type": "Planet",
        "visibility": "Good",
        "bestTime": "Late Evening",
        "direction": "East",
        "description": "Saturn is visible with good conditions and telescope support."
    },
    {
        "id": 5,
        "name": "Orion Nebula",
        "type": "Nebula",
        "visibility": "Excellent",
        "bestTime": "Tonight",
        "direction": "North-East",
        "description": "The Orion Nebula is a bright deep-sky object."
    }
]

@object_visibility_bp.route("/api/object-visibility", methods=["GET"])
def get_object_visibility():
    return jsonify({
        "success": True,
        "location": "Melbourne Observatory",
        "currentTime": datetime.now().strftime("%I:%M %p"),
        "objects": VISIBLE_OBJECTS
    })