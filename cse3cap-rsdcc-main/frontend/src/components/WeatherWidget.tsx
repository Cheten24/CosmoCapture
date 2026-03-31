"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart3, List } from "lucide-react"

interface WeatherData {
  temperature: string
  dew_point: string
  pressure: string
  humidity: string
}

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"values" | "graph">("values")

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await apiService.getWeatherData()

        setWeatherData({
          temperature: `${data.temperature}°C`,
          humidity: `${data.humidity}%`,
          pressure: `${data.pressure} hPa`,
          dew_point: `${data.dewPoint}`,
        })
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [])

  const temperatureData = [
    { time: "00:00", value: 18 },
    { time: "04:00", value: 16 },
    { time: "08:00", value: 20 },
    { time: "12:00", value: 24 },
    { time: "16:00", value: 26 },
    { time: "20:00", value: 22 },
  ]

  const humidityData = [
    { time: "00:00", value: 65 },
    { time: "04:00", value: 70 },
    { time: "08:00", value: 60 },
    { time: "12:00", value: 55 },
    { time: "16:00", value: 50 },
    { time: "20:00", value: 58 },
  ]

  const pressureData = [
    { time: "00:00", value: 1013 },
    { time: "04:00", value: 1014 },
    { time: "08:00", value: 1015 },
    { time: "12:00", value: 1013 },
    { time: "16:00", value: 1012 },
    { time: "20:00", value: 1013 },
  ]

  const dewPointData = [
    { time: "00:00", value: 12 },
    { time: "04:00", value: 11 },
    { time: "08:00", value: 13 },
    { time: "12:00", value: 15 },
    { time: "16:00", value: 16 },
    { time: "20:00", value: 14 },
  ]

  if (loading) {
    return <div className="bg-slate-800 p-4 rounded-lg shadow-xl text-center text-white">Loading weather...</div>
  }

  if (error) {
    return <div className="bg-red-800 p-4 rounded-lg shadow-xl text-center text-white">Error: {error}</div>
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-slate-600 pb-3">
        <h3 className="text-xl font-bold text-white">Live Weather Conditions</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView("values")}
            className={`p-2 rounded-lg transition-colors ${
              view === "values" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
            title="Values View"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("graph")}
            className={`p-2 rounded-lg transition-colors ${
              view === "graph" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
            title="Graph View"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {view === "values" ? (
          weatherData ? (
            <div className="grid grid-cols-2 gap-4 text-center text-white h-full content-center">
              <div>
                <p className="text-sm text-slate-400">Temperature</p>
                <p className="text-2xl font-semibold">{weatherData.temperature}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Dew Point</p>
                <p className="text-2xl font-semibold">{weatherData.dew_point}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Pressure</p>
                <p className="text-2xl font-semibold">{weatherData.pressure}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Humidity</p>
                <p className="text-2xl font-semibold">{weatherData.humidity}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 flex items-center justify-center h-full">
              No weather data available.
            </div>
          )
        ) : (
          <div className="space-y-4 h-full overflow-y-auto pr-2">
            {/* Temperature Chart */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">Temperature</p>
                <p className="text-lg font-bold text-blue-400">{weatherData?.temperature || "N/A"}</p>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 30]} width={35} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", fontSize: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity Chart */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">Humidity</p>
                <p className="text-lg font-bold text-green-400">{weatherData?.humidity || "N/A"}</p>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} width={35} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", fontSize: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pressure Chart */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">Pressure</p>
                <p className="text-lg font-bold text-orange-400">{weatherData?.pressure || "N/A"}</p>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={pressureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[1000, 1020]} width={40} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", fontSize: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Dew Point Chart */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">Dew Point</p>
                <p className="text-lg font-bold text-purple-400">{weatherData?.dew_point || "N/A"}</p>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={dewPointData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 20]} width={35} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", fontSize: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeatherWidget
