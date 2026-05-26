"use client"

import { useState, useRef, useEffect } from "react"
import ScrollReveal from "../components/ScrollReveal"
import { Maximize2, Minimize2 } from "lucide-react"
import PhoneCamera from "../components/PhoneCamera"

const TelescopeViewPage = () => {
  const [isViewFullScreen, setIsViewFullScreen] = useState(false)
  const viewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsViewFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const toggleViewFullScreen = () => {
    if (!document.fullscreenElement && viewRef.current) {
      viewRef.current.requestFullscreen()
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  return (
    <div className="min-h-screen bg-transparent py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Telescope View
              </h1>
              <p className="text-slate-400">
                Live camera feed, image capture, and video recording
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6">
          <ScrollReveal>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                System Status Dashboard
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    System Info
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Location</span>
                      <span className="text-white font-semibold">
                        Melbourne, AU
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Time Zone</span>
                      <span className="text-white font-semibold">
                        AEST/AEDT
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Storage</span>
                      <span className="text-blue-400 font-semibold">
                        Images / Videos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Live System
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Telescope Status</span>
                      <span className="text-green-400 font-semibold">
                        Online
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Camera Feed</span>
                      <span className="text-green-400 font-semibold">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">System Mode</span>
                      <span className="text-blue-400 font-semibold">
                        Monitoring
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div
              ref={viewRef}
              className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 ${
                isViewFullScreen ? "flex flex-col h-screen" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Live Telescope Camera
                </h2>

                <button
                  onClick={toggleViewFullScreen}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isViewFullScreen ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}

                  {isViewFullScreen ? "Exit" : "Fullscreen"}
                </button>
              </div>

              <PhoneCamera />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}

export default TelescopeViewPage