# Video Streaming Architecture

This document describes the video streaming setup and architecture for the telescope control system.

## Overview

The system uses a multi-stream architecture with two distinct video feeds:
- **Telescope Camera Feed** (`/telescope-camera`) - Shows the physical telescope setup and mount
- **Telescope View Feed** (`/telescope-view`) - Shows what the telescope is actually observing

## Architecture Components

### 1. MediaMTX Server
**Role**: Central streaming server that handles multiple protocols
**Port**: 8889 (WebRTC), 8888 (HLS), 1935 (RTMP)
**Configuration**: `backend/mediamtx.yml`

```yaml
# WebRTC server (WHEP)
webrtcAddress: :8889
webrtcAllowOrigin: "*"
webrtcLocalUDPAddress: :8189
webrtcICEServers:
  - stun:stun.l.google.com:19302

# HLS server
hlsAddress: :8888
hlsAllowOrigin: "*"

# Stream paths
paths:
  telescope-camera: {}
  telescope-view: {}
```

### 2. FFmpeg Streamers
**Role**: Convert video files to RTMP streams
**Containers**: `ffmpeg_telescope` and `ffmpeg_telescope_view`

#### Telescope Camera Stream
```bash
ffmpeg -re -stream_loop -1 -i /media/example1-video.mp4 \
  -c:v libx264 -profile:v baseline -level:v 3.1 -pix_fmt yuv420p -preset veryfast \
  -c:a aac -ar 48000 \
  -f flv rtmp://mediamtx:1935/telescope-camera
```

#### Telescope View Stream
```bash
ffmpeg -re -stream_loop -1 -i /media/example-video.mp4 \
  -c:v libx264 -profile:v baseline -level:v 3.1 -pix_fmt yuv420p -preset veryfast \
  -c:a aac -ar 48000 \
  -f flv rtmp://mediamtx:1935/telescope-view
```

### 3. Frontend WebRTC Client
**Role**: Display streams in the browser using WebRTC
**Component**: `WebRTCStreamPlayer.tsx`
**Library**: `whep.ts` for WebRTC connection management

## Stream Flow

```
Video Files → FFmpeg → RTMP → MediaMTX → WebRTC/HLS → Browser
     ↓           ↓        ↓         ↓         ↓
example.mp4 → Encoder → 1935 → Server → 8889/8888 → Client
```

## Setup Instructions

### 1. Environment Variables

Create `frontend/.env`:
```env
VITE_MEDIAMTX_ORIGIN=http://localhost:8889
VITE_STREAM_PATH_1=/telescope-camera
VITE_STREAM_PATH_2=/telescope-view
```

### 2. Docker Compose Setup

```bash
cd backend
docker-compose up -d
```

This starts:
- **MediaMTX**: Streaming server on ports 8889, 8888, 1935
- **FFmpeg Telescope**: Streams example1-video.mp4 to telescope-camera
- **FFmpeg Telescope View**: Streams example-video.mp4 to telescope-view
- **API**: Backend API on port 8080
- **Frontend**: React app on port 5173

### 3. Stream URLs

#### WebRTC (WHEP) URLs
- Telescope Camera: `http://localhost:8889/telescope-camera/whep`
- Telescope View: `http://localhost:8889/telescope-view/whep`

#### HLS URLs
- Telescope Camera: `http://localhost:8888/telescope-camera/index.m3u8`
- Telescope View: `http://localhost:8888/telescope-view/index.m3u8`

#### Built-in Viewer URLs
- Telescope Camera: `http://localhost:8889/telescope-camera`
- Telescope View: `http://localhost:8889/telescope-view`

## Frontend Implementation

### WebRTCStreamPlayer Component

The `WebRTCStreamPlayer` component handles:
- WebRTC connection establishment
- Stream playback controls (Play, Pause, Reconnect)
- Error handling and status management
- Automatic stream reconnection

### Key Features

1. **Auto-connection**: Streams start automatically when component mounts
2. **Manual Controls**: Play, Pause, Reconnect buttons
3. **Status Display**: Shows connection status (idle, connecting, playing, paused, error)
4. **Error Handling**: Graceful error recovery and user feedback

### Stream Management

```typescript
// Connection establishment
const pc = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

// Add transceivers for video and audio
pc.addTransceiver("video", { direction: "recvonly" });
pc.addTransceiver("audio", { direction: "recvonly" });

// Handle incoming tracks
pc.ontrack = (ev) => {
  mediaStream.addTrack(ev.track);
  videoElement.srcObject = mediaStream;
};
```

## Page Structure

### LiveTelescopePage
- **Purpose**: Shows telescope camera feed (site/mount view)
- **Stream**: `/telescope-camera`
- **Features**: Viewer controls, diagnostics, reconnect functionality

### TelescopeViewPage
- **Purpose**: Shows telescope view feed (what telescope is observing)
- **Stream**: `/telescope-view`
- **Features**: Same controls as LiveTelescopePage

## Troubleshooting

### Common Issues

1. **Stream Not Loading**
   - Check MediaMTX is running: `docker ps | grep mediamtx`
   - Verify FFmpeg containers are healthy: `docker ps`
   - Check browser console for WebRTC errors

2. **Connection Timeouts**
   - Verify STUN server accessibility
   - Check firewall settings for UDP ports 8000-8001, 8189
   - Ensure MediaMTX is accessible on port 8889

3. **Video Quality Issues**
   - Check FFmpeg encoding parameters
   - Verify network bandwidth
   - Monitor MediaMTX logs: `docker logs mediamtx`

### Debug Commands

```bash
# Check MediaMTX status
curl http://localhost:8889/v3/config/global/get

# Test stream availability
curl http://localhost:8889/telescope-camera

# Check FFmpeg logs
docker logs ffmpeg_telescope
docker logs ffmpeg_telescope_view

# Monitor MediaMTX logs
docker logs -f mediamtx
```

## Production Considerations

### Security
- Configure CORS properly for production domains
- Use HTTPS for WebRTC connections
- Implement authentication for stream access

### Performance
- Adjust FFmpeg encoding parameters for your hardware
- Consider using hardware acceleration (NVENC, QuickSync)
- Monitor server resources and network bandwidth

### Scalability
- Use load balancers for multiple MediaMTX instances
- Implement stream recording and archiving
- Consider CDN integration for HLS streams

## Stream Configuration

### Video Encoding Settings
- **Codec**: H.264 (libx264)
- **Profile**: Baseline
- **Level**: 3.1
- **Pixel Format**: yuv420p
- **Preset**: veryfast

### Audio Encoding Settings
- **Codec**: AAC
- **Sample Rate**: 48000 Hz

### Network Requirements
- **RTMP**: TCP port 1935
- **WebRTC**: UDP ports 8000-8001, 8189
- **HLS**: TCP port 8888
- **MediaMTX API**: TCP port 8889

## Monitoring

### Health Checks
- FFmpeg containers have health checks for stream availability
- API service has health check endpoint
- MediaMTX provides status via API

### Logs
- MediaMTX: `docker logs mediamtx`
- FFmpeg: `docker logs ffmpeg_telescope`
- Frontend: Browser developer console
- Backend: `docker logs api`

This streaming architecture provides a robust, scalable solution for real-time telescope video feeds with multiple viewing options and comprehensive monitoring capabilities.
