"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { apiService, type TelescopeStatus, type SpaceObject } from "../services/api"
import ControlLockOverlay from "./ControlLockOverlay"

type Props = {
  /** Called whenever the user selects an object; passes the readable name */
  onSelectedObjectChange?: (name: string) => void
}

const TelescopeControlPanel = ({ onSelectedObjectChange }: Props) => {
  const [telescopeStatus, setTelescopeStatus] = useState<TelescopeStatus | null>(null)
  const [selectedObject, setSelectedObject] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [spaceObjects, setSpaceObjects] = useState<SpaceObject[]>([])
  const [objectsLoading, setObjectsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectedRef = useRef<boolean>(false)

  const fetchSpaceObjects = useCallback(async () => {
    try {
      setObjectsLoading(true)
      const response = await apiService.getSpaceObjects({
        location: "-37.7136,144.9631", // Melbourne coordinates
        limit: 20,
      })
      setSpaceObjects(response.objects)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch space objects:", err)
      setError("Could not load celestial objects")
    } finally {
      setObjectsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSpaceObjects()
  }, [fetchSpaceObjects])

  const fetchStatus = useCallback(async () => {
    try {
      const status = await apiService.getTelescopeStatus()
      setTelescopeStatus(status)
      isConnectedRef.current = status.connected
      setError(null) // Clear errors on successful fetch
    } catch (err) {
      console.error("Failed to fetch telescope status:", err)
      // Don't set error for polling failures to avoid UI spam
    }
  }, [])

  useEffect(() => {
    fetchStatus()

    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }

      const interval = isConnectedRef.current ? 2000 : 5000
      pollingIntervalRef.current = setInterval(fetchStatus, interval)
    }

    startPolling()

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [fetchStatus])

  const startLoadingWithTimeout = useCallback(() => {
    setIsLoading(true)
    setLoadingTimeout(false)
    setError(null)

    loadingTimeoutRef.current = setTimeout(() => {
      setLoadingTimeout(true)
    }, 8000) // 8 seconds timeout warning
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingTimeout(false)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  const resetOperation = useCallback(() => {
    stopLoading()
    setError(null)
    fetchStatus() // Refresh status
  }, [stopLoading, fetchStatus])

  const handleConnect = async () => {
    if (!telescopeStatus) return

    startLoadingWithTimeout()
    try {
      const newStatus = await apiService.connectTelescope(!telescopeStatus.connected)
      setTelescopeStatus(newStatus)
      isConnectedRef.current = newStatus.connected
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect/disconnect telescope"
      setError(errorMessage)
      console.error("Connection error:", err)
    } finally {
      stopLoading()
    }
  }

  const handleTracking = async () => {
    if (!telescopeStatus?.connected) return

    startLoadingWithTimeout()
    try {
      const newStatus = await apiService.setTelescopeTracking(!telescopeStatus.tracking)
      setTelescopeStatus(newStatus)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle tracking"
      setError(errorMessage)
      console.error("Tracking error:", err)
    } finally {
      stopLoading()
    }
  }

  const handlePark = async () => {
    if (!telescopeStatus?.connected) return

    startLoadingWithTimeout()
    try {
      const newStatus = telescopeStatus.parked
        ? await apiService.unparkTelescope()
        : await apiService.parkTelescope("park")

      setTelescopeStatus(newStatus)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Failed to ${telescopeStatus.parked ? "unpark" : "park"} telescope: ${errorMessage}`)
      console.error("Park operation failed:", err)
    } finally {
      stopLoading()
    }
  }

  const handleSlewToTarget = async () => {
    if (!selectedObject || !telescopeStatus?.connected) return

    const target = spaceObjects.find((obj) => obj.id === selectedObject)
    if (!target) return

    startLoadingWithTimeout()
    try {
      const response = await apiService.selectSpaceObject(target.id)
      await fetchStatus()
      if (response.message) {
        setError(`Success: ${response.message}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to select target"
      setError(errorMessage)
      console.error("Object selection error:", err)
    } finally {
      stopLoading()
    }
  }

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Filter objects based on search query
  const filteredObjects = searchQuery.trim()
    ? spaceObjects.filter((obj) =>
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.constellation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : spaceObjects

  return (
    <ControlLockOverlay className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4 border-b border-slate-600 pb-3 text-white">Telescope Controls</h3>

      {error && (
        <div className="mb-4 p-2 bg-red-600 text-white text-sm rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-200 hover:text-white"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {loadingTimeout && (
        <div className="mb-4 p-2 bg-yellow-600 text-white text-sm rounded flex justify-between items-center">
          <span>Operation is taking longer than expected...</span>
          <button onClick={resetOperation} className="ml-2 bg-yellow-700 hover:bg-yellow-800 px-2 py-1 rounded text-xs">
            Reset
          </button>
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-white">Connection</h4>
        <div className="flex gap-2">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className={`flex-1 font-bold py-2 px-4 rounded-md transition-colors ${
              telescopeStatus?.connected ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"
            } text-white disabled:opacity-50`}
          >
            {isLoading ? "Processing..." : telescopeStatus?.connected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </div>

      {telescopeStatus?.connected && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-white">Telescope Control</h4>
          <div className="flex gap-2">
            <button
              onClick={handleTracking}
              disabled={isLoading}
              className={`flex-1 font-bold py-2 px-4 rounded-md transition-colors ${
                telescopeStatus.tracking ? "bg-yellow-600 hover:bg-yellow-500" : "bg-blue-600 hover:bg-blue-500"
              } text-white disabled:opacity-50`}
            >
              {telescopeStatus.tracking ? "Stop Tracking" : "Start Tracking"}
            </button>

            <button
              onClick={handlePark}
              disabled={isLoading}
              className={`flex-1 font-bold py-2 px-4 rounded-md transition-colors ${
                telescopeStatus.parked ? "bg-green-600 hover:bg-green-500" : "bg-orange-600 hover:bg-orange-500"
              } text-white disabled:opacity-50`}
            >
              {telescopeStatus.parked ? "Unpark" : "Park"}
            </button>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-2 text-white">Object Selection</h4>
        {objectsLoading ? (
          <div className="p-4 text-center text-slate-400">Loading celestial objects...</div>
        ) : spaceObjects.length === 0 ? (
          <div className="p-4 text-center text-slate-400">No objects available</div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search objects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-2 px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery.trim() && filteredObjects.length === 0 && (
              <div className="p-2 text-center text-slate-400 text-sm">
                No objects match your search
              </div>
            )}
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {filteredObjects.map((obj) => (
              <li
                key={obj.id}
                onClick={() => {
                  setSelectedObject(obj.id)
                  onSelectedObjectChange?.(obj.name) // <-- notify parent with readable name
                }}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  selectedObject === obj.id ? "bg-blue-600" : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <p className="font-bold text-white">{obj.name}</p>
                <p className="text-sm text-slate-400">
                  {obj.type} • {obj.constellation}
                </p>
                <p className="text-xs text-slate-500">
                  Mag: {obj.magnitude} • Alt: {obj.altitude.toFixed(1)}° • Az: {obj.azimuth.toFixed(1)}°
                </p>
              </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-600">
        <h4 className="font-semibold mb-2 text-white">Actions</h4>
        <button
          onClick={handleSlewToTarget}
          disabled={
            !selectedObject || !telescopeStatus?.connected || telescopeStatus?.parked || isLoading || objectsLoading
          }
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? "Slewing..." : "Move Telescope to Selected Target"}
        </button>
        {!telescopeStatus?.connected && <p className="text-xs text-slate-400 mt-1">Connect telescope first</p>}
        {telescopeStatus?.connected && telescopeStatus?.parked && (
          <p className="text-xs text-slate-400 mt-1">Unpark telescope to slew</p>
        )}
      </div>
    </ControlLockOverlay>
  )
}

export default TelescopeControlPanel
