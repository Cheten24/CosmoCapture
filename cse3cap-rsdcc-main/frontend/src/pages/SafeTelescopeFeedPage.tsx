"use client"


import ScrollReveal from "../components/ScrollReveal"
import WeatherWidget from "../components/WeatherWidget"
import TelescopeControlPanel from "../components/TelescopeControlPanel"
import TelescopeOrientation from "../components/TelescopeOrientation"
import SystemStatus from "../components/SystemStatus"
import StatusDashboard from "../components/StatusDashboard"
import ErrorBoundary from "../components/ErrorBoundary"
import { Camera, AlertTriangle } from "lucide-react"

const SafeTelescopeFeedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-[1600px] mx-auto px-6">
        <ScrollReveal>
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">Telescope Feed (Safe Mode)</h1>
            <p className="text-slate-400 text-lg">Telescope controls without video streaming to prevent crashes</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:auto-rows-fr">
          {/* Main Telescope Feed Placeholder - Takes 8 columns on xl screens */}
          <ScrollReveal className="xl:col-span-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-2xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Telescope Feed</h2>
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">Safe Mode</span>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 border border-slate-700 overflow-hidden aspect-video">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                  <div className="text-xl mb-2">Video Stream Disabled</div>
                  <div className="text-sm opacity-70 max-w-md">
                    The video streaming component has been temporarily disabled to prevent browser crashes.
                    All telescope controls remain fully functional.
                  </div>
                  <div className="text-xs opacity-50 mt-4">
                    Stream URL: http://localhost:8889/telescope-camera/whep
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="xl:col-span-4 flex flex-col gap-8 h-full">
            <ScrollReveal delay={0.1} className="flex-1">
              <div className="h-full">
                <WeatherWidget />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <TelescopeControlPanel />
            </ScrollReveal>
          </div>
        </div>

        {/* Status Dashboard - Full width */}
        <ScrollReveal delay={0.3}>
          <ErrorBoundary>
            <StatusDashboard className="mt-8" />
          </ErrorBoundary>
        </ScrollReveal>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-8">
          <ScrollReveal delay={0.4} className="xl:col-span-6">
            <TelescopeOrientation />
          </ScrollReveal>

          <ScrollReveal delay={0.5} className="xl:col-span-6">
            <SystemStatus />
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}

export default SafeTelescopeFeedPage