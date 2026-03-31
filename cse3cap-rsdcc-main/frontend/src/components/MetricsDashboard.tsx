"use client"

import { useState, useEffect } from "react"
import { Globe, Zap, HardDrive, Telescope, Link, BarChart } from "lucide-react"

interface MetricValue {
  value: number
  timestamp: string
  labels: Record<string, string>
}

interface MetricsResponse {
  success: boolean
  metrics: Record<string, MetricValue>
  timestamp: string
}

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState<Record<string, MetricValue>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/observability/metrics`,
      )
      const data: MetricsResponse = await response.json()

      if (data.success) {
        setMetrics(data.metrics)
        setError(null)
      } else {
        setError("Failed to fetch metrics")
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
    fetchMetrics()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchMetrics, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const formatMetricValue = (key: string, value: number) => {
    if (key.includes("duration") || key.includes("time")) {
      return `${value.toFixed(3)}s`
    }
    if (key.includes("usage") || key.includes("percent")) {
      return `${value.toFixed(1)}%`
    }
    if (key.includes("bytes") || key.includes("memory")) {
      return `${(value / 1024 / 1024).toFixed(1)}MB`
    }
    return value.toString()
  }

  const getMetricColor = (key: string, value: number) => {
    if (key.includes("error") || key.includes("failed")) {
      return value > 0 ? "text-red-400" : "text-green-400"
    }
    if (key.includes("usage")) {
      if (value > 80) return "text-red-400"
      if (value > 60) return "text-yellow-400"
      return "text-green-400"
    }
    if (key.includes("connection") || key.includes("status")) {
      return value > 0 ? "text-green-400" : "text-red-400"
    }
    return "text-blue-400"
  }

  const getMetricIcon = (key: string) => {
    if (key.includes("request")) return <Globe className="w-5 h-5" />
    if (key.includes("cpu")) return <Zap className="w-5 h-5" />
    if (key.includes("memory")) return <HardDrive className="w-5 h-5" />
    if (key.includes("telescope")) return <Telescope className="w-5 h-5" />
    if (key.includes("connection")) return <Link className="w-5 h-5" />
    return <BarChart className="w-5 h-5" />
  }

  const formatMetricName = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) {
    return <div className="bg-slate-800 p-4 rounded-lg shadow-xl text-center text-white">Loading metrics...</div>
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
        <h3 className="text-xl font-bold text-white">System Metrics</h3>
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
          <button
            onClick={fetchMetrics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="bg-red-800 p-3 rounded mb-4 text-white text-sm">Error: {error}</div>}

      {Object.keys(metrics).length === 0 ? (
        <div className="text-center text-slate-400 py-8">No metrics available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metrics).map(([key, metric]) => (
            <div key={key} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMetricIcon(key)}</span>
                  <h4 className="text-sm font-medium text-slate-300">{formatMetricName(key)}</h4>
                </div>
                <span className="text-xs text-slate-500">{new Date(metric.timestamp).toLocaleTimeString()}</span>
              </div>

              <div className={`text-2xl font-bold mb-2 ${getMetricColor(key, metric.value)}`}>
                {formatMetricValue(key, metric.value)}
              </div>

              {Object.keys(metric.labels).length > 0 && (
                <div className="space-y-1">
                  {Object.entries(metric.labels).map(([labelKey, labelValue]) => (
                    <div key={labelKey} className="flex justify-between text-xs">
                      <span className="text-slate-400">{labelKey}:</span>
                      <span className="text-slate-300">{labelValue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MetricsDashboard
