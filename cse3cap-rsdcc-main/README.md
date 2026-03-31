# Remote Scientific Data Capture and Control System

## Project Overview

A comprehensive web-based platform enabling remote telescope control and astronomical observation. This system provides real-time telescope control via ASCOM Alpaca protocol, dual video streaming, weather monitoring, safety management, and image capture capabilities. Developed for educational astronomy applications, particularly for school students across Victoria to access and control telescopes remotely.

##  Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Flask Backend  │    │ ASCOM Telescope │
│   (TypeScript)  │◄──►│    (Python)     │◄──►│   Simulator     │
│                 │    │                 │    │                 │
│  • UI Controls  │    │ • REST API      │    │ • SimScope      │
│  • Video Stream │    │ • Safety Logic  │    │ • Alpaca Server │
│  • Real-time    │    │ • Weather API   │    │ • Port 32323    │
│    Updates      │    │ • Observability │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   MediaMTX      │              │
         └──────────────►│ Streaming Server│◄─────────────┘
                        │                 │
                        │ • WebRTC/HLS    │
                        │ • Dual Streams  │
                        │ • Port 8889     │
                        └─────────────────┘

sequenceDiagram
    participant React as Web UI
    participant Flask as Python backend (Flask)
    participant WeatherAPI as Weather API
    participant MediaMTX as Media MTX
    participant ASCOM as Telescope or ASCOM simulator

    %% Fetching weather
    React->>+Flask: Fetch weather info
    Flask->>+WeatherAPI: Fetch weather info with API key
    WeatherAPI->>-Flask: Weather data
    Flask->>-React: Weather data

    %% Controlling telescope
    React->>+Flask: Send telescope instruction
    Flask->>+ASCOM: Send telescope instruction
    ASCOM->>-Flask: Respond with confirmation
    Flask->>-React: Respond with confirmation

    %% Streaming
    React->>+Flask: Initiate stream
    Flask->>+ASCOM: Initiate stream
    ASCOM->>-Flask: Send back stream data
    Flask->>-React: Stream data via WebRTC

```

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Material UI, Framer Motion |
| **Backend** | Python 3.11, Flask, AstroPy, OpenTelemetry, ASCOM Alpaca |
| **Streaming** | MediaMTX, WebRTC, HLS, FFmpeg |
| **DevOps** | Docker, Docker Compose, GitHub Actions |
| **Monitoring** | Grafana, OpenTelemetry (LGTM Stack) |
| **Weather** | ThingSpeak API Integration |
| **Storage** | Local filesystem, organized by date/object |

## Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Python 3.11+** (for local development)
- **Node.js 18+** (for frontend development)
- **ASCOM SimScope** (Windows only, for telescope simulation)

### 1. Clone Repository
```bash
git clone <repository-url>
cd cse3cap-rsdcc
```

### 2. Backend Setup (Docker - Recommended)
```bash
cd backend

# Copy environment configuration
cp .env.example .env
# Edit .env with your settings (see Configuration section)

# Start all services
docker compose up --build
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs
- **Video Streams**: http://localhost:8889
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)

## Project Structure

```
cse3cap-rsdcc/
├── backend/                    # Python Flask Backend
│   ├── app/
│   │   ├── __init__.py        # Flask app factory
│   │   ├── routes/            # API endpoints
│   │   │   ├── telescope.py   # Telescope control
│   │   │   ├── captures.py    # Image capture
│   │   │   ├── safety.py      # Safety management
│   │   │   ├── space_objects.py # Object catalog
│   │   │   └── visibility.py  # Visibility calculations
│   │   ├── services/          # Business logic
│   │   │   ├── alpaca_client.py    # ASCOM interface
│   │   │   ├── safety_manager.py   # Safety coordination
│   │   │   ├── visibility_service.py # Object visibility
│   │   │   ├── weather_safety.py   # Weather monitoring
│   │   │   └── time_service.py     # Time calculations
│   │   ├── models/            # Data models
│   │   ├── utils/             # Utility functions
│   │   ├── telescope.py       # Legacy telescope routes
│   │   ├── weather.py         # Weather API routes
│   │   ├── telemetry.py       # OpenTelemetry setup
│   │   └── docs.py            # API documentation
│   ├── captures/              # Image storage directory
│   ├── scripts/               # Utility scripts
│   ├── tests/                 # Test files
│   ├── docker-compose.yml     # Multi-service setup
│   ├── Dockerfile             # Backend container
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                 # Application entry point
│   └── mediamtx.yml          # Streaming server config
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navigation.tsx # Main navigation
│   │   │   ├── WebRTCStreamPlayer.tsx # Video player
│   │   │   ├── SnapshotCapture.tsx # Image capture
│   │   │   ├── TelescopeControls.tsx # Control panel
│   │   │   ├── WeatherDisplay.tsx # Weather info
│   │   │   ├── SafetyStatus.tsx # Safety indicator
│   │   │   └── RecentCaptures.tsx # Capture history
│   │   ├── pages/             # Page components
│   │   │   ├── HomePage.tsx   # Landing page
│   │   │   ├── TelescopeFeedPage.tsx # Main control
│   │   │   ├── TelescopeViewPage.tsx # Observation view
│   │   │   ├── WeatherMonitoringPage.tsx # Weather dashboard
│   │   │   ├── RecentCapturesPage.tsx # Capture gallery
│   │   │   ├── ObservabilityPage.tsx # System monitoring
│   │   │   └── ObjectVisibilityDemo.tsx # Object catalog
│   │   ├── services/          # API communication
│   │   │   └── api.ts         # API service layer
│   │   ├── contexts/          # React contexts
│   │   │   └── SafetyContext.tsx # Safety state management
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Utility functions
│   │   └── lib/               # Third-party integrations
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── Dockerfile             # Frontend container
│   └── nginx.conf             # Production web server
└── docs/                      # Documentation files
    ├── README.md              # This file
    ├── ASCOM_SETUP_BACKEND.md # ASCOM setup guide
    ├── VIDEO_STREAMING_README.md # Streaming architecture
    └── SNAPSHOT_SYSTEM_EXPLAINED.md # Image capture system
```

## Configuration

### Backend Environment Variables (.env)

```bash
# Flask Server Configuration
PORT=8080
FLASK_HOST=0.0.0.0
FLASK_ENV=development
FLASK_DEBUG=True

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ASCOM Alpaca Telescope Configuration
ALPACA_BASE=http://localhost:32323/api/v1/telescope/0
CLIENT_ID=1

# Weather API Configuration (ThingSpeak)
THINGSPEAK_API_BASE_URL=https://api.thingspeak.com
THINGSPEAK_CHANNEL_ID=270748

# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-lgtm:4317
OTEL_SERVICE_NAME=telescope-backend
OTEL_ENVIRONMENT=development

# Storage Configuration
CAPTURES_DIR=/data/captures
```

### Frontend Environment Variables (.env)

```bash
# API Configuration
VITE_API_URL=http://localhost:8080

# Streaming Configuration
VITE_MEDIAMTX_ORIGIN=http://localhost:8889
VITE_STREAM_PATH_1=/telescope-camera
VITE_STREAM_PATH_2=/telescope-view
```

## Core Features

### 1. Telescope Control System
- **Real-time Control**: Direct ASCOM Alpaca integration for telescope commands
- **Position Tracking**: Live RA/Dec and Alt/Az coordinate display
- **Slewing Operations**: Precise movement to celestial coordinates
- **Park/Unpark**: Safe telescope positioning
- **Tracking Control**: Sidereal tracking enable/disable
- **Status Monitoring**: Connection, slewing, and operational status

### 2. Safety Management System
- **Time-based Safety**: Automatic closure during daylight hours
- **Weather Integration**: Real-time weather condition monitoring
- **Safety Thresholds**: Configurable limits for temperature, humidity, pressure
- **Viewing Windows**: Melbourne timezone-aware operational hours
- **Safety Locks**: Prevents operations during unsafe conditions
- **Status API**: Comprehensive safety status reporting

### 3. Dual Video Streaming
- **Telescope Camera**: Shows physical telescope and mount setup
- **Telescope View**: Shows what the telescope is observing
- **WebRTC Streaming**: Low-latency real-time video via WHEP protocol
- **HLS Fallback**: HTTP Live Streaming for broader compatibility
- **Stream Controls**: Play, pause, reconnect functionality
- **Auto-reconnection**: Automatic stream recovery on connection loss

### 4. Weather Monitoring
- **Real-time Data**: Live weather conditions from ThingSpeak API
- **Multiple Parameters**: Temperature, humidity, pressure, dew point
- **Trend Analysis**: Historical weather data visualization
- **Safety Integration**: Weather-based operational decisions
- **Alert System**: Notifications for unsafe weather conditions

### 5. Object Visibility System
- **Dynamic Calculations**: Real-time celestial object positions using AstroPy
- **Comprehensive Database**: 50+ objects including planets, stars, nebulae, galaxies
- **Visibility Filtering**: Elevation-based filtering for observable objects
- **Object Metadata**: Detailed information including magnitude, distance, constellation
- **Caching System**: Performance-optimized visibility calculations
- **Real-time Updates**: Background position updates every 2 minutes

### 6. Image Capture System
- **Video Frame Capture**: Direct capture from live video streams
- **Metadata Integration**: Automatic coordinate and timestamp embedding
- **Organized Storage**: Date and object-based directory structure
- **Auto-download**: Immediate download to user's device
- **Capture History**: Browsable gallery of all captured images
- **JSON Metadata**: Detailed capture information in sidecar files

### 7. System Observability
- **Comprehensive Logging**: Structured logging with multiple levels
- **Metrics Collection**: Performance and operational metrics
- **Distributed Tracing**: Request flow tracking across services
- **Health Monitoring**: Service health checks and status reporting
- **Grafana Dashboard**: Visual monitoring and alerting
- **OpenTelemetry**: Industry-standard observability framework

## API Documentation

### Telescope Control Endpoints

```http
# Get telescope status
GET /api/telescope/status
Response: {
  "connected": boolean,
  "tracking": boolean,
  "parked": boolean,
  "slewing": boolean,
  "ra": number,
  "dec": number,
  "az": number,
  "alt": number
}

# Connect/disconnect telescope
POST /api/telescope/connect
Body: { "connected": boolean }

# Control tracking
POST /api/telescope/tracking
Body: { "on": boolean }

# Park/unpark telescope
POST /api/telescope/park
Body: { "action": "park" | "unpark" }

# Slew to coordinates
POST /api/telescope/slew/coords
Body: { "ra": number, "dec": number }

# Slew to alt/az
POST /api/telescope/slew/altaz
Body: { "az": number, "alt": number }

# Get visible objects
GET /api/telescope/visible-objects
Query: ?type=Planet&constellation=Leo&min_elevation=20
```

### Safety System Endpoints

```http
# Get safety status
GET /api/safety/status
Response: {
  "status": "ACTIVE" | "UNSAFE" | "CLOSED",
  "reason": string,
  "nextAvailable": string,
  "currentTime": string,
  "viewingWindow": {
    "start": string,
    "end": string
  }
}

# Get viewing window
GET /api/safety/viewing-window
Response: {
  "current": {
    "start": string,
    "end": string,
    "isActive": boolean
  },
  "next": {
    "start": string,
    "end": string
  },
  "sunrise": string,
  "sunset": string,
  "isDaylightSaving": boolean,
  "timeZone": string
}

# Get weather safety
GET /api/safety/weather
Response: {
  "safe": boolean,
  "conditions": object,
  "thresholds": object,
  "timestamp": string
}
```

### Space Objects Endpoints

```http
# Get space objects
GET /api/space-objects
Query: ?location=-37.7136,144.9631&time=2025-01-01T00:00:00Z&limit=10&type=planet
Response: {
  "success": boolean,
  "timestamp": string,
  "location": { "latitude": number, "longitude": number },
  "objects": Array<SpaceObject>,
  "totalCount": number
}

# Select space object for telescope
POST /api/telescope/select
Body: { "objectId": string }
Response: {
  "success": boolean,
  "message": string,
  "objectId": string,
  "objectName": string,
  "targetCoordinates": object,
  "estimatedTime": number,
  "status": string
}
```

### Image Capture Endpoints

```http
# Upload capture
POST /api/captures
Content-Type: multipart/form-data
Body: FormData with file, objectName, timestamp, coordinates

# List captures
GET /api/captures
Response: {
  "items": Array<{
    "id": string,
    "objectName": string,
    "timestamp": string,
    "coordinates": object,
    "file": string,
    "relativeDir": string
  }>
}

# Download capture
GET /api/captures/{id}/download
Response: PNG image file
```

### Weather Endpoints

```http
# Get current weather
GET /weather/feeds
GET /weather/temperature
GET /weather/humidity
GET /weather/pressure
GET /weather/dew_point
GET /weather/trends
```

### Observability Endpoints

```http
# Get logs
GET /api/observability/logs
Query: ?level=ERROR&limit=100&since=2025-01-01T00:00:00Z

# Get metrics
GET /api/observability/metrics

# Get traces
GET /api/observability/traces

# Health check
GET /api/observability/health
GET /health
```

## Video Streaming Architecture

### Stream Configuration

The system provides dual video streams:

1. **Telescope Camera** (`/telescope-camera`)
   - Shows physical telescope setup and mount
   - Port: 8889 (WebRTC), 8888 (HLS)
   - Format: H.264/AAC, 4Mbps bitrate

2. **Telescope View** (`/telescope-view`)
   - Shows what the telescope is observing
   - Port: 8889 (WebRTC), 8888 (HLS)
   - Format: H.264/AAC, 3Mbps bitrate

### Streaming Flow

```
Video Files → FFmpeg → RTMP → MediaMTX → WebRTC/HLS → Browser
     ↓           ↓        ↓         ↓         ↓
example.mp4 → Encoder → 1935 → Server → 8889/8888 → Client
```

### Stream URLs

**WebRTC (WHEP) - Low Latency:**
- Telescope Camera: `http://localhost:8889/telescope-camera/whep`
- Telescope View: `http://localhost:8889/telescope-view/whep`

**HLS - Compatibility:**
- Telescope Camera: `http://localhost:8888/telescope-camera/index.m3u8`
- Telescope View: `http://localhost:8888/telescope-view/index.m3u8`

## Image Capture System

### Storage Structure

Images are stored in an organized directory structure:

```
captures/
└── YYYY/
    └── MM/
        └── DD/
            └── <object-name>/
                ├── YYYYMMDDTHHMMSS_<id>.png
                └── YYYYMMDDTHHMMSS_<id>.json
```

### Capture Process

1. **Frame Capture**: Extract current video frame using HTML5 Canvas
2. **Coordinate Fetch**: Get current telescope position from API
3. **Metadata Creation**: Combine image data with coordinates and timestamp
4. **Upload**: Send multipart form data to backend
5. **Storage**: Save PNG image and JSON metadata
6. **Download**: Automatic download to user's device
7. **History**: Add to capture history for browsing

### Metadata Format

```json
{
  "id": "a1b2c3d4e5f6",
  "objectName": "Moon",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "coordinates": {
    "ra": 12.345,
    "dec": 45.678,
    "alt": 67.89,
    "az": 123.45
  },
  "file": "20250101T120000_a1b2c3d4e5f6.png",
  "relativeDir": "2025/01/01/moon"
}
```

## Safety System

### Safety States

- **ACTIVE**: Safe to operate telescope
- **UNSAFE**: Unsafe due to weather conditions
- **CLOSED**: Closed due to time restrictions (daylight hours)

### Time-based Safety

- **Viewing Window**: 8:00 PM to 6:00 AM Melbourne time
- **Daylight Saving**: Automatic DST adjustment
- **Sunrise/Sunset**: Astronomical calculations for precise timing

### Weather-based Safety

**Monitored Parameters:**
- Temperature: -5°C to 45°C
- Humidity: < 85%
- Atmospheric Pressure: 950-1050 hPa
- Dew Point Difference: > 3°C
- Wind Speed: < 30 km/h

**Data Source**: ThingSpeak API with real-time weather station data

### Safety Integration

All telescope operations check safety status before execution:
- Connection attempts blocked during unsafe conditions
- Slewing operations prevented when system is locked
- Clear error messages explain safety restrictions
- Automatic system recovery when conditions improve

## Object Visibility System

### Object Database

**50+ Celestial Objects:**
- **Planets**: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune
- **Stars**: Sirius, Canopus, Alpha Centauri, Arcturus, Vega, etc.
- **Nebulae**: Orion, Carina, Tarantula, Eagle, Rosette, etc.
- **Galaxies**: Andromeda, Large/Small Magellanic Clouds, etc.
- **Clusters**: Omega Centauri, 47 Tucanae, Pleiades, etc.

### Visibility Calculations

**Real-time Positioning:**
- AstroPy library for precise astronomical calculations
- Melbourne coordinates: -37.7214°, 145.0489°
- Minimum elevation: 20° above horizon
- Dynamic coordinate transformations (RA/Dec ↔ Alt/Az)

**Caching System:**
- 5-minute cache duration for performance
- Background updates every 2 minutes
- Position change detection (0.1° threshold)
- Thread-safe cache management

**Enhanced Metadata:**
- Constellation information
- Distance measurements
- Magnitude values
- Rise/set time predictions
- Observability ratings

## System Monitoring

### OpenTelemetry Integration

**Logging:**
- Structured JSON logging
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- Request correlation IDs
- Performance timing

**Metrics:**
- HTTP request counters
- Response time histograms
- Error rate tracking
- System resource usage

**Tracing:**
- Distributed request tracing
- Service dependency mapping
- Performance bottleneck identification
- End-to-end request flow

### Grafana Dashboard

**Access**: http://localhost:3000 (admin/admin)

**Dashboards:**
- System Overview
- API Performance
- Error Tracking
- Resource Utilization
- Custom Alerts

## Testing

### Backend Testing

```bash
cd backend

# Run unit tests
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_telescope.py

# Run with coverage
python -m pytest --cov=app tests/

# Test telescope connection
python scripts/test_telescope_api.py

# Debug ASCOM connection
python scripts/debug_alpaca_connection.py
```

### Frontend Testing

```bash
cd frontend

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Integration Testing

```bash
# Start all services
docker compose up -d

# Test API endpoints
curl http://localhost:8080/health
curl http://localhost:8080/api/telescope/status
curl http://localhost:8080/api/safety/status

# Test video streams
curl http://localhost:8889/telescope-camera
curl http://localhost:8888/telescope-camera/index.m3u8
```

## Deployment

### Development Deployment

```bash
# Backend with Docker
cd backend
docker compose up --build

# Frontend development server
cd frontend
npm run dev
```

### Production Deployment

```bash
# Build production images
docker build -t telescope-backend:latest backend/
docker build -t telescope-frontend:latest frontend/

# Run production stack
docker compose -f docker-compose.prod.yml up -d
```

### Environment-specific Configuration

**Development:**
- Debug mode enabled
- Hot reloading
- Detailed logging
- CORS permissive

**Production:**
- Debug mode disabled
- Optimized builds
- Error logging only
- Strict CORS policy
- HTTPS enforcement
- Rate limiting

## Troubleshooting

### Common Issues

**1. Telescope Connection Failed**
```
Error: Cannot connect to telescope simulator
Solution: 
- Ensure SimScope is running on Windows
- Check ALPACA_BASE URL in .env
- Verify port 32323 is accessible
- Run: python scripts/find_alpaca_port.py
```

**2. Video Streams Not Loading**
```
Error: WebRTC connection failed
Solution:
- Check MediaMTX container is running
- Verify FFmpeg containers are healthy
- Check browser console for errors
- Test stream URLs directly
```

**3. Weather Data Unavailable**
```
Error: Weather API timeout
Solution:
- Check ThingSpeak API key
- Verify internet connectivity
- Check THINGSPEAK_CHANNEL_ID
- Review weather service logs
```

**4. Safety System Locked**
```
Error: Telescope operations are locked
Solution:
- Check current Melbourne time
- Verify viewing window (8 PM - 6 AM)
- Check weather conditions
- Review safety status API
```

**5. Image Capture Failed**
```
Error: Snapshot capture failed
Solution:
- Ensure video stream is playing
- Check CAPTURES_DIR permissions
- Verify disk space available
- Check backend logs for errors
```

### Debug Commands

```bash
# Check service status
docker ps
docker compose logs api
docker compose logs mediamtx

# Test API connectivity
curl -v http://localhost:8080/health
curl -v http://localhost:8080/api/telescope/status

# Check stream availability
curl http://localhost:8889/telescope-camera
ffprobe http://localhost:8888/telescope-camera/index.m3u8

# Monitor logs in real-time
docker compose logs -f api
docker compose logs -f mediamtx

# Check file permissions
ls -la backend/captures/
df -h  # Check disk space
```

### Performance Optimization

**Backend:**
- Enable Redis caching for visibility calculations
- Use connection pooling for database operations
- Implement request rate limiting
- Optimize AstroPy calculations

**Frontend:**
- Enable React production build
- Implement component lazy loading
- Use service workers for caching
- Optimize bundle size with tree shaking

**Streaming:**
- Adjust FFmpeg encoding parameters
- Use hardware acceleration when available
- Implement adaptive bitrate streaming
- Monitor bandwidth usage

## Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: Follow Quick Start guide
4. **Make changes**: Follow coding standards
5. **Run tests**: Ensure all tests pass
6. **Commit changes**: Use conventional commits
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open Pull Request**: Describe changes and testing

### Coding Standards

**Python (Backend):**
- Follow PEP 8 style guide
- Use type hints where possible
- Write docstrings for functions
- Maximum line length: 100 characters
- Use Black for code formatting

**TypeScript (Frontend):**
- Follow ESLint configuration
- Use TypeScript strict mode
- Write JSDoc comments for components
- Use Prettier for code formatting
- Follow React best practices

**Git Commits:**
- Use conventional commit format
- Examples: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep commits atomic and focused
- Write clear commit messages

### Testing Requirements

- **Unit Tests**: All new functions must have tests
- **Integration Tests**: API endpoints must be tested
- **Type Safety**: TypeScript strict mode compliance
- **Code Coverage**: Maintain >80% coverage
- **Manual Testing**: Test UI interactions thoroughly

## License

This project is proprietary software. All developed intellectual property is retained by **Dr. Scott Mann – La Trobe University**.

## Acknowledgements

- **La Trobe University** - Department of Mathematics and Physical Sciences
- **Bendigo Discovery Centre** - Telescope facility and support
- **La Trobe Science Outreach Program** - Educational mission
- **ASCOM Initiative** - Telescope control standards
- **AstroPy Project** - Astronomical calculations library
- **MediaMTX Project** - Video streaming infrastructure

## Team Members

- **Mihini Ranasinghe** - Full-stack Development
- **Vibhi Singh** - Frontend Development
- **Melisha Shrestha** - Backend Development
- **Udit Dipeshbhai** - System Integration
- **Toby Scott** - DevOps and Infrastructure

**Project Supervisor**: Dr. Scott Mann, La Trobe University

## Support

For technical support or questions:

1. **Check Documentation**: Review this README and linked documentation
2. **Search Issues**: Look for similar problems in project issues
3. **Create Issue**: Open a new issue with detailed description
4. **Contact Team**: Reach out to development team members
5. **Academic Support**: Contact Dr. Scott Mann for academic questions

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Active Development
