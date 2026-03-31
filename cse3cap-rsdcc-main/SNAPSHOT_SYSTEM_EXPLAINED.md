# 📸 Snapshot System - Complete Explanation

## 🗂️ **Where Images Are Stored**

### Local Development (non-Docker)
```
cse3cap-rsdcc/
└── backend/
    └── captures/          ← Images stored here on your local machine
        └── 2025/
            └── 10/
                └── 19/
                    ├── moon/
                    │   ├── 20251019T143022_a1b2c3d4e5f6.png
                    │   └── 20251019T143022_a1b2c3d4e5f6.json
                    └── jupiter/
                        ├── 20251019T150533_7g8h9i0j1k2l.png
                        └── 20251019T150533_7g8h9i0j1k2l.json
```

### Docker Environment
```
Inside Container:            Host Machine (Your Computer):
/data/captures/       ←→     backend/captures/
    └── 2025/                    └── 2025/
        └── 10/                      └── 10/
            └── 19/                      └── 19/
                └── moon/                    └── moon/
                                                 ├── image.png
                                                 └── metadata.json
```

**Volume Mapping** (in `docker-compose.yml`):
```yaml
volumes:
  - ./captures:/data/captures
```
This means:
- Inside Docker container: `/data/captures/`
- On your computer: `backend/captures/`
- They're the same folder!

---

## 📁 **Directory Structure Explained**

### Format: `/data/captures/YYYY/MM/DD/<object-name>/`

**Example:**
```
/data/captures/
├── 2025/
│   └── 10/
│       └── 19/
│           ├── moon/
│           │   ├── 20251019T143022_a1b2c3d4e5f6.png    ← Image file
│           │   └── 20251019T143022_a1b2c3d4e5f6.json   ← Metadata
│           │
│           ├── jupiter/
│           │   ├── 20251019T150533_7g8h9i0j1k2l.png
│           │   └── 20251019T150533_7g8h9i0j1k2l.json
│           │
│           └── telescope-view/  ← From TelescopeViewPage
│               ├── 20251019T162045_m3n4o5p6q7r8.png
│               └── 20251019T162045_m3n4o5p6q7r8.json
```

### File Naming Convention

**Image:** `YYYYMMDDTHHMMSS_<12-char-id>.png`
- `20251019T143022` = Date & Time (2025-10-19 at 14:30:22)
- `a1b2c3d4e5f6` = Unique ID (first 12 chars of UUID)
- `.png` = Image format

**Metadata:** Same name but `.json` extension

### Metadata JSON Structure
```json
{
  "id": "a1b2c3d4e5f6",
  "objectName": "Moon",
  "timestamp": "2025-10-19T14:30:22.123456+00:00",
  "coordinates": {
    "ra": 12.345,     // Right Ascension
    "dec": 45.678,    // Declination
    "alt": 67.89,     // Altitude
    "az": 123.45      // Azimuth
  },
  "file": "20251019T143022_a1b2c3d4e5f6.png",
  "relativeDir": "2025/10/19/moon"
}
```

---

## 🔄 **Complete Snapshot Flow**

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS "📸 Snapshot" BUTTON                             │
│    Location: TelescopeFeedPage or TelescopeViewPage            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND: Capture Video Frame                                │
│    - SnapshotCapture component grabs current video frame        │
│    - Uses HTML5 Canvas to capture frame from <video> element    │
│    - Validates video is ready and has dimensions                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND: Fetch Telescope Coordinates                        │
│    GET http://localhost:8080/api/telescope/status               │
│    Response: { ra: 12.345, dec: 45.678, alt: 67.89, az: 123.45}│
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND: Convert to PNG Blob                                │
│    - Canvas.toBlob() converts frame to PNG binary data          │
│    - Creates FormData object with:                              │
│      • file: PNG blob                                           │
│      • objectName: "Moon" (or selected object)                  │
│      • timestamp: ISO string                                    │
│      • ra, dec, alt, az: coordinate values                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. FRONTEND: Upload to Backend                                  │
│    POST http://localhost:8080/api/captures                      │
│    Content-Type: multipart/form-data                            │
│    Body: FormData with image + metadata                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND: Process Upload (captures.py)                        │
│    - Receives file and metadata                                 │
│    - Generates unique ID                                        │
│    - Creates directory path: /data/captures/YYYY/MM/DD/object/  │
│    - Saves PNG file                                             │
│    - Creates JSON metadata file                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. BACKEND: Return Response                                     │
│    Response: {                                                  │
│      success: true,                                             │
│      id: "a1b2c3d4e5f6",                                        │
│      downloadUrl: "/api/captures/a1b2c3d4e5f6/download"        │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. FRONTEND: Auto-Download Image                                │
│    - Creates temporary <a> tag with download URL                │
│    - Clicks it programmatically                                 │
│    - Image downloads to user's Downloads folder                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. FRONTEND: Show Success & Refresh                             │
│    - Display green success message: "Snapshot captured!"        │
│    - Refresh RecentCaptures component                           │
│    - New capture appears in the list                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 **Configuration Details**

### Environment Variables

**Backend (`backend/docker-compose.yml`):**
```yaml
environment:
  CAPTURES_DIR: /data/captures  # Where images are stored in container
```

**Default (if not set):**
```python
# In backend/app/routes/captures.py
root = os.getenv("CAPTURES_DIR", "/data/captures")
```

**Frontend (`.env` or environment):**
```bash
VITE_API_URL=http://localhost:8080  # Backend API URL
```

---

## 📡 **API Endpoints**

### 1. Upload Capture
```http
POST /api/captures
Content-Type: multipart/form-data

FormData:
  - file: <PNG binary>
  - objectName: "Moon"
  - timestamp: "2025-10-19T14:30:22.123456Z"
  - ra: "12.345"
  - dec: "45.678"
  - alt: "67.89"
  - az: "123.45"
```

**Response:**
```json
{
  "success": true,
  "id": "a1b2c3d4e5f6",
  "downloadUrl": "/api/captures/a1b2c3d4e5f6/download"
}
```

### 2. List All Captures
```http
GET /api/captures
```

**Response:**
```json
{
  "items": [
    {
      "id": "a1b2c3d4e5f6",
      "objectName": "Moon",
      "timestamp": "2025-10-19T14:30:22.123456+00:00",
      "coordinates": {
        "ra": 12.345,
        "dec": 45.678,
        "alt": 67.89,
        "az": 123.45
      },
      "file": "20251019T143022_a1b2c3d4e5f6.png",
      "relativeDir": "2025/10/19/moon"
    }
  ]
}
```

### 3. Download Specific Capture
```http
GET /api/captures/{id}/download
```

**Response:** PNG image file as attachment

---

## 💡 **Key Components**

### Frontend Components

**1. `SnapshotCapture.tsx`**
- Captures video frame
- Fetches coordinates
- Uploads to backend
- Shows success/error messages

**2. `RecentCaptures.tsx`**
- Lists recent captures
- Shows metadata
- Provides download links
- Can be refreshed via ref

**3. `RecentCapturesPage.tsx`**
- Full-page view of all captures
- Grid layout with cards
- Loading/error states

### Backend Files

**1. `backend/app/routes/captures.py`**
- Handles upload endpoint
- Creates directory structure
- Saves images and metadata
- Provides download endpoint

**2. `backend/captures/`**
- Physical storage location on host
- Organized by date and object

---

## 🎯 **Finding Your Images**

### On Your Computer:

**Windows:**
```
C:\Users\mihin\Downloads\cse3cap-rsdcc\backend\captures\
```

**Mac/Linux:**
```
~/Downloads/cse3cap-rsdcc/backend/captures/
```

### Inside Docker Container:
```
/data/captures/
```

### Downloaded Images:
User's browser downloads folder (e.g., `C:\Users\mihin\Downloads\`)

---

## 🧪 **Testing the System**

1. **Start the backend:**
   ```bash
   cd backend
   python run.py
   ```

2. **Check the API:**
   ```bash
   curl http://localhost:8080/api/captures
   ```

3. **Take a snapshot via UI:**
   - Go to http://localhost:5173/telescope-feed
   - Wait for video to load
   - Click "📸 Snapshot"

4. **Check file system:**
   ```bash
   ls -R backend/captures/
   ```

5. **Check downloads folder:**
   - Look in your browser's Downloads folder
   - Should see `snapshot_YYYY-MM-DDTHH-MM-SS.png`

---

## 🎓 **Summary**

| Aspect | Details |
|--------|---------|
| **Storage Location (Docker)** | Inside: `/data/captures/`<br>Host: `backend/captures/` |
| **Storage Location (Local)** | `backend/captures/` |
| **Directory Structure** | `YYYY/MM/DD/<object-name>/` |
| **File Format** | PNG images + JSON metadata |
| **File Naming** | `YYYYMMDDTHHMMSS_<id>.{png,json}` |
| **Upload Endpoint** | `POST /api/captures` |
| **List Endpoint** | `GET /api/captures` |
| **Download Endpoint** | `GET /api/captures/{id}/download` |
| **Frontend Components** | SnapshotCapture, RecentCaptures, RecentCapturesPage |
| **Auto-download** | Yes, to browser's Downloads folder |
| **Metadata Stored** | Object name, timestamp, RA/Dec/Alt/Az coordinates |

**In short:** Images are stored in `backend/captures/` on your computer, organized by date and object name, with both PNG images and JSON metadata files! 🎉

