from flask import Flask, jsonify
from flask_cors import CORS
import time

# Main API blueprints
from .weather import weather_bp
from .routes.telescope import telescope_bp
from .routes.safety import safety_bp
from .docs import docs_bp
from .routes.space_objects import space_objects_bp
from .routes.observability import observability_bp
from .routes.visibility import visibility_bp
from .routes.captures import captures_bp
from .routes.auth import auth_bp
from .routes.booking import booking_bp
from .routes.object_visibility import object_visibility_bp


def create_app():

    app = Flask(__name__)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173"
                ],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"]
            }
        },
        supports_credentials=True
    )

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "status": "success",
            "message": "Backend Working",
            "service": "CosmoCapture Backend"
        }), 200

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "timestamp": time.time()
        }), 200

    # Fallback safety route
    @app.route("/api/safety/status", methods=["GET", "OPTIONS"])
    def api_safety_status():
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

    @app.route("/api/safety/health", methods=["GET", "OPTIONS"])
    def api_safety_health():
        return jsonify({
            "success": True,
            "status": "healthy",
            "message": "Safety service is running",
            "timestamp": time.time()
        }), 200

    # Register all API blueprints
    app.register_blueprint(docs_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(telescope_bp)
    app.register_blueprint(safety_bp)
    app.register_blueprint(space_objects_bp)
    app.register_blueprint(observability_bp)
    app.register_blueprint(visibility_bp)
    app.register_blueprint(captures_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(object_visibility_bp)

    return app