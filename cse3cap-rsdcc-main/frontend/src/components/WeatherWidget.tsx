import { useEffect, useState } from "react"

interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  dewPoint: number
  windSpeed?: number
}

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/weather")

        if (!response.ok) {
          throw new Error("Failed to fetch weather data")
        }

        const data = await response.json()

        console.log("Weather API Response:", data)

        setWeatherData({
          temperature: data.temperature,
          humidity: data.humidity,
          pressure: data.pressure,
          dewPoint: data.dewPoint,
          windSpeed: data.windSpeed,
        })
      } catch (error) {
        console.error("Weather fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    const interval = setInterval(fetchWeather, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        Live Weather Conditions
      </h2>

      {loading ? (
        <p className="text-slate-400">Loading weather data...</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-slate-400 mb-2">Temperature</p>
            <p className="text-3xl font-bold text-white">
              {weatherData?.temperature ?? "N/A"}°C
            </p>
          </div>

          <div className="text-center">
            <p className="text-slate-400 mb-2">Dew Point</p>
            <p className="text-3xl font-bold text-white">
              {weatherData?.dewPoint ?? "N/A"}°C
            </p>
          </div>

          <div className="text-center">
            <p className="text-slate-400 mb-2">Pressure</p>
            <p className="text-3xl font-bold text-white">
              {weatherData?.pressure ?? "N/A"}
            </p>
          </div>

          <div className="text-center">
            <p className="text-slate-400 mb-2">Humidity</p>
            <p className="text-3xl font-bold text-white">
              {weatherData?.humidity ?? "N/A"}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherWidget