# ASCOM Telescope Control System - Setup Notes

## Project Overview
This Flask backend provides a REST API interface to control ASCOM Alpaca telescope simulators. It's designed for educational astronomy applications where students can control telescope simulations remotely through a web interface.

## Prerequisites
- **Python 3.8+** with pip
- **SimScope Telescope Simulator** - Download from: https://github.com/rmorgan001/SimScope
- **ASCOM Platform** - Required for SimScope to function properly
- **Virtual Environment** - Recommended for dependency isolation

## Quick Setup Steps

### 1. Environment Setup
\`\`\`bash
# Clone repository
git clone <your-repo-url>
cd <project-folder>/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 2. Configuration
\`\`\`bash
# Option A: Automated setup (recommended)
python scripts/setup.py

# Option B: Manual setup
cp .env.example .env
# Edit .env file with your settings
\`\`\`

### 3. Start Services
\`\`\`bash
# Start SimScope first
# - Launch SimScope application
# - Ensure ASCOM Alpaca server is enabled
# - Default port: 32323

# Start Flask backend with Docker
docker compose up --build
# Backend runs on: http://localhost:8080
\`\`\`

### 4. Testing
\`\`\`bash
# Test telescope connection
python scripts/test_telescope_api.py

# Debug connection issues
python scripts/debug_alpaca_connection.py

# Find simulator port
python scripts/find_alpaca_port.py
\`\`\`

## Environment Variables (.env)
\`\`\`
# ASCOM Alpaca Configuration
ALPACA_BASE=http://localhost:32323/api/v1/telescope/0
CLIENT_ID=1

# Flask Configuration
PORT=5000
FLASK_ENV=development
FLASK_DEBUG=True

# CORS (for frontend integration)
CORS_ORIGINS=http://localhost:5173
\`\`\`

## Docker Configuration
The application is configured to run with Docker Compose:
- Container port: 5000 (internal)
- Host port: 8080 (external)
- Access the API at: http://localhost:8080

## API Endpoints
- `GET /health` - Service health check
- `POST /api/telescope/connect` - Connect to telescope
- `POST /api/telescope/disconnect` - Disconnect from telescope
- `GET /api/telescope/status` - Get telescope status (RA/Dec, tracking, connection)
- `POST /api/telescope/park` - Park telescope
- `POST /api/telescope/unpark` - Unpark telescope
- `POST /api/telescope/start_tracking` - Start tracking
- `POST /api/telescope/stop_tracking` - Stop tracking
- `POST /api/telescope/slew` - Slew to coordinates (RA/Dec)

## Common Issues & Solutions

### Connection Refused Error
- **Problem**: `[WinError 10061] No connection could be made`
- **Solution**: SimScope is not running or wrong port
- **Fix**: Start SimScope, run `python scripts/find_alpaca_port.py`

### Module Not Found Error
- **Problem**: `ModuleNotFoundError: No module named 'flask_cors'`
- **Solution**: Dependencies not installed
- **Fix**: Activate venv and run `pip install -r requirements.txt`

### Wrong Port Configuration
- **Problem**: Test script can't connect to Flask backend
- **Solution**: Port mismatch between Flask and test script
- **Fix**: Check PORT in .env file matches Flask startup message

### CORS Issues (Frontend Integration)
- **Problem**: Frontend can't make API calls
- **Solution**: CORS origins not configured
- **Fix**: Add your frontend URL to CORS_ORIGINS in .env

## File Structure
\`\`\`
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── routes/
│   │   └── telescope.py     # Telescope API endpoints
│   └── services/
│       └── alpaca_client.py # ASCOM Alpaca client
├── scripts/
│   ├── setup.py             # Automated setup
│   ├── test_telescope_api.py # API testing
│   ├── debug_alpaca_connection.py # Connection debugging
│   └── find_alpaca_port.py  # Port scanner
├── .env.example             # Environment template
├── requirements.txt         # Python dependencies
└── run.py                  # Flask entry point
\`\`\`

## Development Notes
- Flask runs in debug mode for development
- All telescope operations are logged for debugging
- Error handling includes proper HTTP status codes
- ASCOM Alpaca client handles connection retries
- Environment variables are loaded automatically
- Application runs in Docker container for consistent environment

## Frontend Integration
When connecting a React/Vue/Angular frontend:
1. Update CORS_ORIGINS in .env with your frontend URL
2. Make API calls to `http://localhost:8080/api/telescope/*`
3. Handle async operations and error responses
4. Consider adding authentication for production use

## Production Deployment
- Set `FLASK_ENV=production` and `FLASK_DEBUG=False`
- Use a proper WSGI server (gunicorn, uWSGI)
- Configure firewall rules for telescope simulator access
- Add authentication and rate limiting
- Use HTTPS for secure communication

## Support
- Check logs in Flask console for detailed error messages
- Use debug scripts for connection troubleshooting
- Refer to ASCOM Alpaca documentation for simulator issues
- SimScope documentation: https://github.com/rmorgan001/SimScope
