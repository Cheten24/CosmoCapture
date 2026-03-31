"use client"

import { useState, useEffect, useCallback } from "react"

interface LogEntry {
  timestamp: string
  level: string
  logger: string
  message: string
  module: string
  function: string
  line: number
  exception?: string
}

interface LogResponse {
  success: boolean
  logs: LogEntry[]
  total: number
  timestamp: string
}

const LogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const logLevels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
      case "CRITICAL":
        return "text-red-400"
      case "WARNING":
        return "text-yellow-400"
      case "INFO":
        return "text-blue-400"
      case "DEBUG":
        return "text-gray-400"
      default:
        return "text-white"
    }
  }

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedLevel) params.append("level", selectedLevel)
      params.append("limit", "50")

      const queryString = params.toString()
      const endpoint = `/api/observability/logs${queryString ? `?${queryString}` : ""}`

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}${endpoint}`)
      const data: LogResponse = await response.json()

      if (data.success) {
        setLogs(data.logs.reverse()) // Show newest first
        setError(null)
      } else {
        setError("Failed to fetch logs")
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedLevel])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchLogs, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [autoRefresh, fetchLogs])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  if (loading) {
    return <div className="bg-slate-800 p-4 rounded-lg shadow-xl text-center text-white">Loading logs...</div>
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
        <h3 className="text-xl font-bold text-white">System Logs</h3>
        <div className="flex items-center gap-4">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 text-sm"
          >
            <option value="">All Levels</option>
            {logLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <label className="flex items-center text-sm text-slate-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto Refresh
          </label>
          <button onClick={fetchLogs} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="bg-red-800 p-3 rounded mb-4 text-white text-sm">Error: {error}</div>}

      <div className="max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center text-slate-400 py-8">No logs available</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="bg-slate-700 p-3 rounded border-l-4 border-slate-500">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{formatTimestamp(log.timestamp)}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${getLevelColor(log.level)} bg-slate-600`}
                    >
                      {log.level}
                    </span>
                    <span className="text-xs text-slate-400">
                      {log.module}.{log.function}:{log.line}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-white mb-1">{log.message}</div>
                {log.exception && (
                  <div className="text-xs text-red-300 bg-slate-800 p-2 rounded mt-2 font-mono">{log.exception}</div>
                )}
                <div className="text-xs text-slate-500 mt-1">Logger: {log.logger}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LogViewer
