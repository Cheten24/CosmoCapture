"use client"

import { useState, useEffect } from "react"
import { apiService, type TelescopeStatus } from "../services/api"

const TelescopeOrientation = () => {
  const [telescopeData, setTelescopeData] = useState<TelescopeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTelescopeStatus = async () => {
      try {
        const status = await apiService.getTelescopeStatus()
        setTelescopeData(status)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch telescope status:", err)
        setError("Failed to connect to telescope")
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchTelescopeStatus()

    // Set up polling every 2 seconds for real-time updates
    const interval = setInterval(fetchTelescopeStatus, 2000)

    return () => clearInterval(interval)
  }, [])

  const formatCoordinates = (ra: number, dec: number, az: number, alt: number) => {
    // Convert RA from decimal hours to hours:minutes:seconds
    const raHours = Math.floor(ra)
    const raMinutes = Math.floor((ra - raHours) * 60)
    const raSeconds = Math.floor(((ra - raHours) * 60 - raMinutes) * 60)

    // Convert Dec from decimal degrees to degrees:minutes:seconds
    const decDegrees = Math.floor(Math.abs(dec))
    const decMinutes = Math.floor((Math.abs(dec) - decDegrees) * 60)
    const decSecondsVal = Math.floor(((Math.abs(dec) - decDegrees) * 60 - decMinutes) * 60)
    const decSign = dec >= 0 ? "+" : "-"

    return {
      azimuth: `${az.toFixed(1)}°`,
      elevation: `${alt.toFixed(1)}°`,
      rightAscension: `${raHours.toString().padStart(2, "0")}h ${raMinutes.toString().padStart(2, "0")}m ${raSeconds.toString().padStart(2, "0")}s`,
      declination: `${decSign}${decDegrees}° ${decMinutes.toString().padStart(2, "0")}' ${decSecondsVal.toString().padStart(2, "0")}"`,
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-4 border-b border-slate-600 pb-3 text-white">Telescope Orientation</h3>
        <div className="text-center text-slate-400 py-4">Loading telescope data...</div>
      </div>
    )
  }

  if (error || !telescopeData) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-4 border-b border-slate-600 pb-3 text-white">Telescope Orientation</h3>
        <div className="text-center text-red-400 py-4">{error || "No telescope data available"}</div>
      </div>
    )
  }

  const orientationData = formatCoordinates(telescopeData.ra, telescopeData.dec, telescopeData.az, telescopeData.alt)

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4 border-b border-slate-600 pb-3 text-white flex items-center justify-between">
        Telescope Orientation
        <span className={`text-xs px-2 py-1 rounded ${telescopeData.connected ? "bg-green-600" : "bg-red-600"}`}>
          {telescopeData.connected ? "Connected" : "Disconnected"}
        </span>
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between items-center py-2 border-b border-slate-600">
          <span className="text-sm font-semibold text-slate-300">Azimuth</span>
          <span className="text-sm font-mono text-white">{orientationData.azimuth}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-600">
          <span className="text-sm font-semibold text-slate-300">Elevation</span>
          <span className="text-sm font-mono text-white">{orientationData.elevation}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-600">
          <span className="text-sm font-semibold text-slate-300">RA (Right Ascension)</span>
          <span className="text-sm font-mono text-white">{orientationData.rightAscension}</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-semibold text-slate-300">Dec (Declination)</span>
          <span className="text-sm font-mono text-white">{orientationData.declination}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-600">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`px-2 py-1 rounded text-center ${telescopeData.tracking ? "bg-green-600" : "bg-gray-600"}`}>
            {telescopeData.tracking ? "Tracking" : "Not Tracking"}
          </div>
          <div className={`px-2 py-1 rounded text-center ${telescopeData.parked ? "bg-yellow-600" : "bg-green-600"}`}>
            {telescopeData.parked ? "Parked" : "Unparked"}
          </div>
          <div
            className={`px-2 py-1 rounded text-center col-span-2 ${telescopeData.slewing ? "bg-blue-600" : "bg-gray-600"}`}
          >
            {telescopeData.slewing ? "Slewing" : "Stationary"}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TelescopeOrientation
