"use client"

import { useState, useRef, useEffect } from "react"
import ScrollReveal from "../components/ScrollReveal"
import WeatherWidget from "../components/WeatherWidget"
import TelescopeControlPanel from "../components/TelescopeControlPanel"
import TelescopeOrientation from "../components/TelescopeOrientation"
import SystemStatus from "../components/SystemStatus"
import StatusDashboard from "../components/StatusDashboard"
import ErrorBoundary from "../components/ErrorBoundary"
import WebRTCStreamPlayer from "../components/WebRTCStreamPlayer"
import SnapshotCapture from "../components/SnapshotCapture"
import RecentCaptures, { type RecentCapturesRef } from "../components/RecentCaptures"
import { Maximize2, Minimize2 } from "lucide-react"

const TelescopeFeedPage = () => {
  const [isFeedFullScreen, setIsFeedFullScreen] = useState(false)
  const [selectedObjectName, setSelectedObjectName] = useState<string>("")
  const feedRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recentCapturesRef = useRef<RecentCapturesRef>(null)

  // Build WHEP URL from env
  const origin = (import.meta.env as Record<string, string>).VITE_MEDIAMTX_ORIGIN?.toString() || "http://localhost:8889"
  const streamPath = (import.meta.env as Record<string, string>).VITE_STREAM_PATH_1?.toString() || "/telescope-camera"
  const whepUrl = `${origin.replace(/\/$/, "")}${streamPath}/whep`

  useEffect(() => {
    const handleFullscreenChange = () => setIsFeedFullScreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFeedFullScreen = () => {
    if (!document.fullscreenElement && feedRef.current) {
      feedRef.current.requestFullscreen()
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  return (
    <div className="min-h-screen bg-transparent py-12 relative z-10" style={{ pointerEvents: 'all' }}>
      <div className="max-w-[1600px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">Telescope Feed</h1>
            <p className="text-slate-400 text-lg">Live telescope view with real-time control</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:auto-rows-fr">
          {/* Main Telescope Feed - Takes 8 columns on xl screens */}
          <ScrollReveal className="xl:col-span-8">
            <div
              ref={feedRef}
              className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 md:p-8 shadow-2xl h-full flex flex-col ${
                isFeedFullScreen ? "h-screen" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-2xl font-bold text-white">Live Telescope Feed</h2>
                <button
                  onClick={toggleFeedFullScreen}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
                  title="Fullscreen Feed"
                >
                  {isFeedFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  {isFeedFullScreen ? "Exit" : "Fullscreen"}
                </button>
              </div>

              <div
                className={`bg-slate-900 rounded-lg text-slate-300 border border-slate-700 overflow-hidden ${
                  isFeedFullScreen ? "flex-1 flex" : "aspect-video"
                }`}
              >
                <WebRTCStreamPlayer
                  whepUrl={whepUrl}
                  label="Telescope Stream"
                  videoRef={videoRef}
                />
              </div>

              {/* Snapshot button */}
              <div className="mt-4">
                <SnapshotCapture 
                  videoRef={videoRef} 
                  selectedObjectName={selectedObjectName}
                  onCaptureSuccess={() => recentCapturesRef.current?.refresh()}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Right-side widgets */}
          <div className="xl:col-span-4 flex flex-col gap-8 h-full">
            <ScrollReveal delay={0.1} className="flex-1">
              <div className="h-full">
                <WeatherWidget />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <TelescopeControlPanel onSelectedObjectChange={setSelectedObjectName} />
            </ScrollReveal>
          </div>
        </div>

        {/* Status Dashboard - Full width */}
        <ScrollReveal delay={0.3}>
          <ErrorBoundary>
            <StatusDashboard className="mt-8" />
          </ErrorBoundary>
        </ScrollReveal>

        {/* Orientation / System status */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-8">
          <ScrollReveal delay={0.4} className="xl:col-span-6">
            <TelescopeOrientation />
          </ScrollReveal>

          <ScrollReveal delay={0.5} className="xl:col-span-6">
            <SystemStatus />
          </ScrollReveal>
        </div>

        {/* Optional: recent captures */}
        <div className="mt-8">
          <ScrollReveal delay={0.5}>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Captures</h3>
              <RecentCaptures ref={recentCapturesRef} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}

export default TelescopeFeedPage