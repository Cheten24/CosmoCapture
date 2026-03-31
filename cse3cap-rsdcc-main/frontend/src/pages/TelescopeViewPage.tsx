"use client"

import { useState, useRef, useEffect } from "react"
import ScrollReveal from "../components/ScrollReveal"
import StatusDashboard from "../components/StatusDashboard"
import ErrorBoundary from "../components/ErrorBoundary"
import WebRTCStreamPlayer from "../components/WebRTCStreamPlayer"
import SnapshotCapture from "../components/SnapshotCapture"
import RecentCaptures, { type RecentCapturesRef } from "../components/RecentCaptures"
import { Maximize2, Minimize2 } from "lucide-react"

const TelescopeViewPage = () => {
  const [isViewFullScreen, setIsViewFullScreen] = useState(false)
  const [selectedObjectName] = useState<string>("Telescope View")
  const viewRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recentCapturesRef = useRef<RecentCapturesRef>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsViewFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleViewFullScreen = () => {
    if (!document.fullscreenElement && viewRef.current) {
      viewRef.current.requestFullscreen()
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  return (
    <div className="min-h-screen bg-transparent py-8 relative z-10" style={{ pointerEvents: 'all' }}>
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Telescope View</h1>
              <p className="text-slate-400">Current telescope field of view</p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6">
          {/* Status Dashboard */}
          <ScrollReveal>
            <ErrorBoundary>
              <StatusDashboard />
            </ErrorBoundary>
          </ScrollReveal>

          {/* Main Telescope View */}
          <ScrollReveal delay={0.2}>
            <div
              ref={viewRef}
              className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 ${
                isViewFullScreen ? "flex flex-col h-screen" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Live Telescope View</h2>
                <button
                  onClick={toggleViewFullScreen}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                  title="Fullscreen View"
                >
                  {isViewFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  {isViewFullScreen ? "Exit" : "Fullscreen"}
                </button>
              </div>

              <div
                className={`bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 border border-slate-700 ${
                  isViewFullScreen ? "flex-1" : "aspect-video"
                }`}
              >
                <WebRTCStreamPlayer 
                  whepUrl="http://localhost:8889/telescope-view/whep" 
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

          {/* Recent Captures Section */}
          <ScrollReveal delay={0.2}>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Captures</h3>
              <RecentCaptures ref={recentCapturesRef} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}

export default TelescopeViewPage