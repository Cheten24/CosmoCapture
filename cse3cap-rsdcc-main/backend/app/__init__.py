from flask import Flask
import time

# from .telemetry import setup_telemetry  # Temporarily disabled
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

def create_app():
    app = Flask(__name__)

    @app.route("/health")
    def health():
        return {"status": "healthy", "timestamp": time.time()}

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

    return app