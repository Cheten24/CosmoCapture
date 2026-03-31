"use client"

import { useState, useEffect } from "react"

interface TraceSpan {
  trace_id: string
  span_id: string
  operation_name: string
  start_time: string
  end_time: string
  duration_ms: number
  status: string
  tags: Record<string, string>
}

interface TracesResponse {
  success: boolean
  traces: TraceSpan[]
  total: number
  timestamp: string
}

const TraceExplorer = () => {
  const [traces, setTraces] = useState<TraceSpan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTrace, setSelectedTrace] = useState<TraceSpan | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchTraces = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/observability/traces`,
      )
      const data: TracesResponse = await response.json()

      if (data.success) {
        setTraces(data.traces)
        setError(null)
      } else {
        setError("Failed to fetch traces")
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTraces()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchTraces, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const formatDuration = (durationMs: number) => {
    if (durationMs < 1000) {
      return `${durationMs}ms`
    }
    return `${(durationMs / 1000).toFixed(2)}s`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ok":
      case "success":
        return "text-green-400"
      case "error":
      case "failed":
        return "text-red-400"
      case "timeout":
        return "text-yellow-400"
      default:
        return "text-blue-400"
    }
  }

  const getDurationColor = (durationMs: number) => {
    if (durationMs > 5000) return "text-red-400"
    if (durationMs > 1000) return "text-yellow-400"
    return "text-green-400"
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const truncateTraceId = (traceId: string) => {
    return `${traceId.substring(0, 8)}...${traceId.substring(traceId.length - 8)}`
  }

  if (loading) {
    return <div className="bg-slate-800 p-4 rounded-lg shadow-xl text-center text-white">Loading traces...</div>
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
        <h3 className="text-xl font-bold text-white">Distributed Traces</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center text-sm text-slate-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto Refresh
          </label>
          <button onClick={fetchTraces} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="bg-red-800 p-3 rounded mb-4 text-white text-sm">Error: {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traces List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h4 className="text-lg font-semibold text-white mb-2">Recent Traces</h4>
          {traces.length === 0 ? (
            <div className="text-center text-slate-400 py-8">No traces available</div>
          ) : (
            traces.map((trace) => (
              <div
                key={`${trace.trace_id}-${trace.span_id}`}
                className={`bg-slate-700 p-3 rounded cursor-pointer border-l-4 transition-colors ${
                  selectedTrace?.span_id === trace.span_id
                    ? "border-blue-500 bg-slate-600"
                    : "border-slate-500 hover:bg-slate-650"
                }`}
                onClick={() => setSelectedTrace(trace)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-1">{trace.operation_name}</div>
                    <div className="text-xs text-slate-400">Trace: {truncateTraceId(trace.trace_id)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${getDurationColor(trace.duration_ms)}`}>
                      {formatDuration(trace.duration_ms)}
                    </div>
                    <div className={`text-xs ${getStatusColor(trace.status)}`}>{trace.status}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">{formatTimestamp(trace.start_time)}</div>
              </div>
            ))
          )}
        </div>

        {/* Trace Details */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Trace Details</h4>
          {selectedTrace ? (
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-2">Operation</h5>
                <div className="text-white">{selectedTrace.operation_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-1">Duration</h5>
                  <div className={`font-semibold ${getDurationColor(selectedTrace.duration_ms)}`}>
                    {formatDuration(selectedTrace.duration_ms)}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-1">Status</h5>
                  <div className={`font-semibold ${getStatusColor(selectedTrace.status)}`}>{selectedTrace.status}</div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-1">Trace ID</h5>
                <div className="text-xs text-slate-400 font-mono break-all">{selectedTrace.trace_id}</div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-1">Span ID</h5>
                <div className="text-xs text-slate-400 font-mono">{selectedTrace.span_id}</div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-2">Timeline</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start:</span>
                    <span className="text-white">{formatTimestamp(selectedTrace.start_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">End:</span>
                    <span className="text-white">{formatTimestamp(selectedTrace.end_time)}</span>
                  </div>
                </div>
              </div>

              {Object.keys(selectedTrace.tags).length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Tags</h5>
                  <div className="space-y-1">
                    {Object.entries(selectedTrace.tags).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-white font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">Select a trace to view details</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TraceExplorer
