"use client"

import { Link } from "react-router-dom"
import { useRef, useState } from "react"
import ScrollReveal from "../components/ScrollReveal"
import WebRTCStreamPlayer from "../components/WebRTCStreamPlayer"
import TelescopeControlPanel from "../components/TelescopeControlPanel"
import SnapshotCapture from "../components/SnapshotCapture"
import RecentCaptures from "../components/RecentCaptures"

const LiveTelescopePage = () => {
  // Environment setup for the stream
  const origin =
    (import.meta.env as Record<string, string>).VITE_MEDIAMTX_ORIGIN?.toString() || "http://localhost:8889"
  const streamPath =
    (import.meta.env as Record<string, string>).VITE_STREAM_PATH_1?.toString() || "/telescope-camera"
  const whepUrl = `${origin.replace(/\/$/, "")}${streamPath}/whep`

  // Ref to access video element for snapshots
  const videoRef = useRef<HTMLVideoElement>(null)

  // Store the currently selected object name (for metadata)
  const [selectedObjectName, setSelectedObjectName] = useState<string>("")

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <ScrollReveal direction="down" delay={0.1}>
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 text-center">
            Live Telescope Feed
          </h1>
          <p className="text-lg text-gray-600 text-center mt-2">
            Real-time telescope video stream and capture
          </p>
        </div>
      </ScrollReveal>

      {/* Main content */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Telescope Control Panel */}
          <div className="lg:col-span-1">
            <TelescopeControlPanel onSelectedObjectChange={setSelectedObjectName} />
          </div>

          {/* RIGHT: Live Stream and Snapshot */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live WebRTC stream */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <WebRTCStreamPlayer
                  whepUrl={whepUrl}
                  label="Telescope Live Feed"
                  videoRef={videoRef}
                />
              </div>

              {/* Snapshot capture controls */}
              <div className="mt-4">
                <SnapshotCapture
                  videoRef={videoRef}
                  selectedObjectName={selectedObjectName}
                />
              </div>
            </div>

            {/* Recent captures list */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <RecentCaptures />
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}

export default LiveTelescopePage
