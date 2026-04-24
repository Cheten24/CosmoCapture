from flask import Flask
import time

from .routes.booking import booking_bp


def create_app():
    app = Flask(__name__)

    @app.route("/health")
    def health():
        return {"status": "healthy", "timestamp": time.time()}

    app.register_blueprint(booking_bp)

    return app