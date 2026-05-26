from flask import Blueprint, request, jsonify
import os
import requests
import logging
import base64

logger = logging.getLogger(__name__)

camera_bp = Blueprint('camera', __name__, url_prefix='/api/camera')

ALPACA_BASE = os.getenv(
    'ALPACA_CAMERA_BASE',
    'http://localhost:32323/api/v1/camera/0'
)

CLIENT_ID = int(os.getenv('CLIENT_ID', '1'))


def alpaca_get(action):
    url = f"{ALPACA_BASE}/{action}"

    try:
        res = requests.get(
            url,
            params={
                "ClientID": CLIENT_ID,
                "ClientTransactionID": 1
            },
            timeout=5
        )

        return res.json()

    except Exception as e:
        logger.error(f"Alpaca GET {action} failed: {e}")

        return {
            "ErrorNumber": -1,
            "ErrorMessage": str(e)
        }


def alpaca_put(action, data={}):
    url = f"{ALPACA_BASE}/{action}"

    try:
        payload = {
            "ClientID": CLIENT_ID,
            "ClientTransactionID": 1,
            **data
        }

        res = requests.put(
            url,
            data=payload,
            timeout=10
        )

        return res.json()

    except Exception as e:
        logger.error(f"Alpaca PUT {action} failed: {e}")

        return {
            "ErrorNumber": -1,
            "ErrorMessage": str(e)
        }


@camera_bp.route('/status', methods=['GET'])
def camera_status():
    """Get camera status"""

    try:
        connected = alpaca_get('connected')

        if connected.get('ErrorNumber', 0) != 0:
            return jsonify({
                'connected': False,
                'error': connected.get('ErrorMessage')
            }), 200

        is_connected = connected.get('Value', False)

        if not is_connected:
            return jsonify({
                'connected': False
            }), 200

        camera_state = alpaca_get('camerastate')
        sensor_name = alpaca_get('sensorname')
        width = alpaca_get('cameraxsize')
        height = alpaca_get('cameraysize')

        return jsonify({
            'connected': True,
            'cameraState': camera_state.get('Value', 0),
            'sensorName': sensor_name.get('Value', 'Unknown'),
            'width': width.get('Value', 0),
            'height': height.get('Value', 0),
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


@camera_bp.route('/connect', methods=['POST'])
def connect_camera():
    """Connect to camera"""

    try:
        result = alpaca_put('connected', {
            'Connected': True
        })

        if result.get('ErrorNumber', 0) != 0:
            return jsonify({
                'success': False,
                'error': result.get('ErrorMessage')
            }), 400

        return jsonify({
            'success': True,
            'message': 'Camera connected'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@camera_bp.route('/disconnect', methods=['POST'])
def disconnect_camera():
    """Disconnect camera"""

    try:
        result = alpaca_put('connected', {
            'Connected': False
        })

        if result.get('ErrorNumber', 0) != 0:
            return jsonify({
                'success': False,
                'error': result.get('ErrorMessage')
            }), 400

        return jsonify({
            'success': True,
            'message': 'Camera disconnected'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@camera_bp.route('/expose', methods=['POST'])
def expose():
    """Start camera exposure"""

    try:
        data = request.get_json() or {}

        duration = data.get('duration', 1.0)
        light = data.get('light', True)

        result = alpaca_put('startexposure', {
            'Duration': duration,
            'Light': light
        })

        if result.get('ErrorNumber', 0) != 0:
            return jsonify({
                'success': False,
                'error': result.get('ErrorMessage')
            }), 400

        return jsonify({
            'success': True,
            'message': f'Exposure started for {duration}s'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@camera_bp.route('/imageready', methods=['GET'])
def image_ready():
    """Check if image is ready"""

    try:
        result = alpaca_get('imageready')

        return jsonify({
            'ready': result.get('Value', False)
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


@camera_bp.route('/image', methods=['GET'])
def get_image():
    """Get image data"""

    try:
        ready = alpaca_get('imageready')

        if not ready.get('Value', False):
            return jsonify({
                'success': False,
                'error': 'Image not ready yet'
            }), 400

        result = alpaca_get('imagearray')

        if result.get('ErrorNumber', 0) != 0:
            return jsonify({
                'success': False,
                'error': result.get('ErrorMessage')
            }), 400

        return jsonify({
            'success': True,
            'imageArray': result.get('Value', []),
            'message': 'Image data retrieved'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@camera_bp.route('/abort', methods=['POST'])
def abort_exposure():
    """Abort current exposure"""

    try:
        result = alpaca_put('abortexposure')

        if result.get('ErrorNumber', 0) != 0:
            return jsonify({
                'success': False,
                'error': result.get('ErrorMessage')
            }), 400

        return jsonify({
            'success': True,
            'message': 'Exposure aborted'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500