"use client"

import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

const TelescopeView = () => {
  const origin = import.meta.env.VITE_MEDIAMTX_ORIGIN || "http://localhost:8889"
  const streamPath = import.meta.env.VITE_STREAM_PATH || "/telescope-camera"
  const viewerUrl = `${origin.replace(/\/$/, "")}${streamPath}`

  const [iframeError, setIframeError] = useState(false)

  useEffect(() => {
    console.log("[v0] TelescopeView - MediaMTX Viewer URL:", viewerUrl)
    console.log("[v0] TelescopeView - Origin:", origin)
    console.log("[v0] TelescopeView - Stream Path:", streamPath)
  }, [viewerUrl, origin, streamPath])

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl h-full flex flex-col border border-slate-700">
      {/* Header section with Title and Status */}
      <div className="flex justify-between items-center mb-3 border-b border-slate-600 pb-2">
        <Link
          to="/telescope-view"
          className="text-lg font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
        >
          Telescope View
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
          title="Telescope View WebRTC Stream"
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
          onError={() => {
            console.error("[v0] TelescopeView - Failed to load iframe:", viewerUrl)
            setIframeError(true)
          }}
        />
      </div>

      {/* Info at the bottom of the telescope view */}
      <div className="flex items-center justify-end mt-3">
        <p className="text-sm text-slate-400 font-mono">Resolution: 1920x1080 | FPS: 30</p>
      </div>
    </div>
  )
}

export default TelescopeView
