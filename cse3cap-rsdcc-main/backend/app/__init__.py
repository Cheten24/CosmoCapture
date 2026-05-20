from flask import Flask
from flask_cors import CORS
import os
import time
import cv2
from flask import Response
# from .telemetry import setup_telemetry  # Temporarily disabled
# Use a relative import to import from the same package (the 'app' folder)
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
from .routes.camera import camera_bp

def create_app():
    """
    This is the application factory. It creates and configures the Flask app.
    """
    app = Flask(__name__)
        camera = cv2.VideoCapture(0)

    def generate_frames():
        while True:
            success, frame = camera.read()

            if not success:
                break
            else:
                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    @app.route('/video_feed')
    def video_feed():
        return Response(
            generate_frames(),
            
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )
    CORS(app)   

    # app = setup_telemetry(app)  # Temporarily disabled

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
    app.register_blueprint(camera_bp)



    return app
