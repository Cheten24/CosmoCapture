"use client"

import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

const VideoPlayer = () => {
  const origin = import.meta.env.VITE_MEDIAMTX_ORIGIN || "http://localhost:8889"
  const streamPath = import.meta.env.VITE_STREAM_PATH || "/telescope-camera"
  const viewerUrl = `${origin.replace(/\/$/, "")}${streamPath}`

  const [iframeError, setIframeError] = useState(false)

  useEffect(() => {
    console.log("[v0] VideoPlayer - MediaMTX Viewer URL:", viewerUrl)
    console.log("[v0] VideoPlayer - Origin:", origin)
    console.log("[v0] VideoPlayer - Stream Path:", streamPath)
  }, [viewerUrl, origin, streamPath])

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full flex flex-col border border-slate-700">
      {/* Header section with Title and Status */}
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/live-telescope"
          className="text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
        >
          Live Telescope Feed
        </Link>
        <span className="bg-green-600 text-white text-sm font-medium px-3 py-1 rounded-full">Active</span>
      </div>

      <div className="flex-grow aspect-video bg-black rounded-lg overflow-hidden relative">
        {iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white p-4">
            <div className="text-center">
              <p className="text-red-400 font-bold mb-2">Failed to load video stream</p>
              <p className="text-sm text-slate-400 mb-2">URL: {viewerUrl}</p>
              <p className="text-xs text-slate-500">
                Make sure MediaMTX is running and a stream is being published to "{streamPath}"
              </p>
            </div>
          </div>
        )}
        <iframe
          src={viewerUrl}
          title="MediaMTX WebRTC Viewer"
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
          onError={() => {
            console.error("[v0] VideoPlayer - Failed to load iframe:", viewerUrl)
            setIframeError(true)
          }}
        />
      </div>

      {/* Controls at the bottom of the video feed */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg transition-colors">
            Record
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-5 rounded-lg transition-colors">
            Capture
          </button>
        </div>
        <p className="text-sm text-slate-400 font-mono">Resolution: 1920x1080 | FPS: 30</p>
      </div>
    </div>
  )
}

export default VideoPlayer
