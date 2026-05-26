import os
import json
import uuid
import re
import base64
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, send_from_directory, current_app, abort
from werkzeug.utils import secure_filename

captures_bp = Blueprint("captures", __name__, url_prefix="/api/captures")


def _safe_slug(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9\-_.]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "unnamed"


def _captures_root() -> str:
    root = os.path.join(os.getcwd(), "captures")
    os.makedirs(root, exist_ok=True)
    return root


def _images_root() -> str:
    root = os.path.join(os.getcwd(), "images")
    os.makedirs(root, exist_ok=True)
    return root


def _videos_root() -> str:
    root = os.path.join(os.getcwd(), "videos")
    os.makedirs(root, exist_ok=True)
    return root


@captures_bp.route("/image", methods=["POST", "OPTIONS"])
def save_camera_image():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({"success": False, "message": "No image data received"}), 400

        image_data = data["image"]

        if "," in image_data:
            image_data = image_data.split(",", 1)[1]

        filename = f"image_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.png"
        file_path = os.path.join(_images_root(), filename)

        with open(file_path, "wb") as image_file:
            image_file.write(base64.b64decode(image_data))

        return jsonify({
            "success": True,
            "message": "Image saved successfully",
            "filename": filename
        }), 201

    except Exception as e:
        current_app.logger.error(f"Image save error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@captures_bp.route("/video", methods=["POST", "OPTIONS"])
def save_camera_video():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        if "video" not in request.files:
            return jsonify({"success": False, "message": "No video file received"}), 400

        video = request.files["video"]

        original_filename = secure_filename(video.filename or "recording.webm")
        filename = f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}_{original_filename}"
        file_path = os.path.join(_videos_root(), filename)

        video.save(file_path)

        return jsonify({
            "success": True,
            "message": "Video saved successfully",
            "filename": filename
        }), 201

    except Exception as e:
        current_app.logger.error(f"Video save error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@captures_bp.route("/media", methods=["GET"])
def list_media():
    images = []
    videos = []

    for filename in os.listdir(_images_root()):
        if filename.lower().endswith((".png", ".jpg", ".jpeg")):
            images.append({
                "filename": filename,
                "url": f"http://127.0.0.1:5000/api/captures/file/images/{filename}"
            })

    for filename in os.listdir(_videos_root()):
        if filename.lower().endswith((".webm", ".mp4")):
            videos.append({
                "filename": filename,
                "url": f"http://127.0.0.1:5000/api/captures/file/videos/{filename}"
            })

    images.sort(key=lambda x: x["filename"], reverse=True)
    videos.sort(key=lambda x: x["filename"], reverse=True)

    return jsonify({
        "success": True,
        "images": images,
        "videos": videos
    })


@captures_bp.route("/file/<folder>/<filename>", methods=["GET"])
def serve_media_file(folder, filename):
    if folder == "images":
        return send_from_directory(_images_root(), filename)

    if folder == "videos":
        return send_from_directory(_videos_root(), filename)

    abort(404)


@captures_bp.route("", methods=["POST"])
def upload_capture():
    if "file" not in request.files:
        return jsonify({"message": "file is required"}), 400

    f = request.files["file"]

    if not f.filename:
        return jsonify({"message": "file has no filename"}), 400

    object_name = request.form.get("objectName", "Unknown")
    ra = request.form.get("ra")
    dec = request.form.get("dec")
    alt = request.form.get("alt")
    az = request.form.get("az")
    ts = request.form.get("timestamp")

    if ts:
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except Exception:
            dt = datetime.now(timezone.utc)
    else:
        dt = datetime.now(timezone.utc)

    y = dt.strftime("%Y")
    m = dt.strftime("%m")
    d = dt.strftime("%d")

    obj_slug = _safe_slug(object_name)
    root = _captures_root()
    dest_dir = os.path.join(root, y, m, d, obj_slug)
    os.makedirs(dest_dir, exist_ok=True)

    cap_id = uuid.uuid4().hex[:12]
    ts_part = dt.strftime("%Y%m%dT%H%M%S")

    ext = ".png" if (
        f.mimetype == "image/png" or f.filename.lower().endswith(".png")
    ) else ".jpg"

    img_name = f"{ts_part}_{cap_id}{ext}"
    meta_name = f"{ts_part}_{cap_id}.json"

    img_path = os.path.join(dest_dir, img_name)
    meta_path = os.path.join(dest_dir, meta_name)

    f.save(img_path)

    meta = {
        "id": cap_id,
        "objectName": object_name,
        "timestamp": dt.isoformat(),
        "coordinates": {
            "ra": float(ra) if ra else None,
            "dec": float(dec) if dec else None,
            "alt": float(alt) if alt else None,
            "az": float(az) if az else None,
        },
        "file": img_name,
        "relativeDir": os.path.relpath(dest_dir, root)
    }

    with open(meta_path, "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2)

    return jsonify({
        "success": True,
        "id": cap_id,
        "downloadUrl": f"/api/captures/{cap_id}/download"
    }), 201


def _walk_captures():
    root = _captures_root()

    for base, _, files in os.walk(root):
        for fn in files:
            if fn.endswith(".json"):
                yield os.path.join(base, fn)


@captures_bp.route("", methods=["GET"])
def list_captures():
    items = []

    for meta_path in _walk_captures():
        try:
            with open(meta_path, "r", encoding="utf-8") as fh:
                meta = json.load(fh)

            items.append(meta)

        except Exception as e:
            current_app.logger.warning(f"Failed reading {meta_path}: {e}")

    items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

    return jsonify({"items": items})


@captures_bp.route("/<cap_id>/download", methods=["GET"])
def download_capture(cap_id: str):
    for meta_path in _walk_captures():
        try:
            with open(meta_path, "r", encoding="utf-8") as fh:
                meta = json.load(fh)

            if meta.get("id") == cap_id:
                root = _captures_root()
                rel = meta["relativeDir"]
                img = meta["file"]

                return send_from_directory(
                    directory=os.path.join(root, rel),
                    path=img,
                    as_attachment=True
                )

        except Exception as e:
            current_app.logger.warning(f"Lookup error: {e}")

    abort(404)