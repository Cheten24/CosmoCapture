// API service layer for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

interface ApiErrorResponse {
  message: string
}

export interface WeatherData {
  temperature: string
  humidity: string
  pressure: string
  dewPoint: string
}

export interface TrendFeed {
  created_at: string
  entry_id: number
  field1: string | null // Temperature
  field2: string | null // Humidity
  field3: string | null // Pressure
  field4: string | null // Dew Point
}

export interface WeatherTrendResponse {
  channel: Record<string, unknown>
  feeds: TrendFeed[]
}

export interface SpaceObject {
  id: string
  name: string
  type: string
  rightAscension: string
  declination: string
  altitude: number
  azimuth: number
  magnitude: number
  isVisible: boolean
  constellation: string
}

export interface SpaceObjectsResponse {
  success: boolean
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
  objects: SpaceObject[]
  totalCount: number
}

export interface TelescopeSelectResponse {
  success: boolean
  message: string
  objectId: string
  objectName: string
  targetCoordinates: {
    rightAscension: string
    declination: string
    altitude: number
    azimuth: number
  }
  estimatedTime: number
  status: string
}

export interface TelescopeStatus {
  connected: boolean
  tracking: boolean
  parked: boolean
  slewing: boolean
  ra: number
  dec: number
  az: number
  alt: number
  warning?: string
}

export interface RawTelescopeResponse {
  connected?: boolean
  tracking?: boolean
  parked?: boolean
  slewing?: boolean
  ra?: number
  dec?: number
  az?: number
  alt?: number
  warning?: string
}

export interface WeatherResponse {
  feeds: Array<{ field1?: string; field2?: string; field3?: string; field4?: string }>
}

export interface CelestialObject {
  name: string
  type: string
  ra: number
  dec: number
}

export interface LogEntry {
  timestamp: string
  level: string
  logger: string
  message: string
  module: string
  function: string
  line: number
  exception?: string
}

export interface MetricValue {
  value: number
  timestamp: string
  labels: Record<string, string>
}

export interface TraceSpan {
  trace_id: string
  span_id: string
  operation_name: string
  start_time: string
  end_time: string
  duration_ms: number
  status: string
  tags: Record<string, string>
}

export interface LogsResponse {
  success: boolean
  logs: LogEntry[]
  total: number
  timestamp: string
}

export interface MetricsResponse {
  success: boolean
  metrics: Record<string, MetricValue>
  timestamp: string
}

export interface TracesResponse {
  success: boolean
  traces: TraceSpan[]
  total: number
  timestamp: string
}

// Safety status interfaces
export interface SafetyStatusResponse {
  status: 'ACTIVE' | 'UNSAFE' | 'CLOSED'
  reason: string
  nextAvailable?: string
  currentTime: string
  viewingWindow: {
    start: string
    end: string
  }
}

export interface ViewingWindowResponse {
  current: {
    start: string
    end: string
    isActive: boolean
  }
  next: {
    start: string
    end: string
  }
  sunrise: string
  sunset: string
  isDaylightSaving: boolean
  timeZone: string
}

class ApiService {
  private baseUrl: string
  private readonly REQUEST_TIMEOUT = 15000 // 15 seconds for safety APIs

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

    try {
      // Don't set Content-Type for FormData (browser will set it with boundary)
      const headers: Record<string, string> = {}
      if (options?.headers) {
        Object.assign(headers, options.headers)
      }
      if (!(options?.body instanceof FormData)) {
        headers["Content-Type"] = "application/json"
      }

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
        ...options,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`

        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = (await response.json()) as ApiErrorResponse
            if (errorData && typeof errorData === "object" && errorData.message) {
              errorMessage = errorData.message
            }
          }
        } catch (parseError) {
          // If we can't parse the error response, use the default message
          console.warn("Failed to parse error response:", parseError)
        }
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timed out. Please check your connection and try again.")
        }
        if (error.message.includes("Failed to fetch")) {
          throw new Error(
            "Cannot connect to telescope server. Please check if the backend is running on the correct port.",
          )
        }
      }
      throw error
    }
  }

  private validateTelescopeStatus(data: unknown): TelescopeStatus {
    const defaultStatus: TelescopeStatus = {
      connected: false,
      tracking: false,
      parked: true,
      slewing: false,
      ra: 0.0,
      dec: 0.0,
      az: 0.0,
      alt: 0.0,
    }

    if (!data || typeof data !== "object") {
      console.warn("Invalid telescope status response, using defaults")
      return defaultStatus
    }

    const statusData = data as RawTelescopeResponse

    return {
      connected: typeof statusData.connected === "boolean" ? statusData.connected : defaultStatus.connected,
      tracking: typeof statusData.tracking === "boolean" ? statusData.tracking : defaultStatus.tracking,
      parked: typeof statusData.parked === "boolean" ? statusData.parked : defaultStatus.parked,
      slewing: typeof statusData.slewing === "boolean" ? statusData.slewing : defaultStatus.slewing,
      ra: typeof statusData.ra === "number" ? statusData.ra : defaultStatus.ra,
      dec: typeof statusData.dec === "number" ? statusData.dec : defaultStatus.dec,
      az: typeof statusData.az === "number" ? statusData.az : defaultStatus.az,
      alt: typeof statusData.alt === "number" ? statusData.alt : defaultStatus.alt,
      warning: typeof statusData.warning === "string" ? statusData.warning : undefined,
    }
  }

  // Weather API methods with timeout protection
  async getWeatherData(): Promise<WeatherData> {
    try {
      const [temperature, humidity, pressure, dewPoint] = await Promise.allSettled([
        this.request<WeatherResponse>("/weather/temperature"),
        this.request<WeatherResponse>("/weather/humidity"),
        this.request<WeatherResponse>("/weather/pressure"),
        this.request<WeatherResponse>("/weather/dew_point"),
      ])

      return {
        temperature: temperature.status === 'fulfilled' ? temperature.value.feeds[0]?.field1 || "N/A" : "N/A",
        humidity: humidity.status === 'fulfilled' ? humidity.value.feeds[0]?.field2 || "N/A" : "N/A", 
        pressure: pressure.status === 'fulfilled' ? pressure.value.feeds[0]?.field3 || "N/A" : "N/A",
        dewPoint: dewPoint.status === 'fulfilled' ? dewPoint.value.feeds[0]?.field4 || "N/A" : "N/A",
      }
    } catch (error) {
      console.warn('Weather API partially failed, returning fallback data', error)
      return {
        temperature: "N/A",
        humidity: "N/A", 
        pressure: "N/A",
        dewPoint: "N/A",
      }
    }
  }

  async getWeatherTrends(): Promise<WeatherTrendResponse> {
    return this.request<WeatherTrendResponse>("/weather/trends")
  }

  async getVisibleObjects(): Promise<CelestialObject[]> {
    return this.request<CelestialObject[]>("/api/telescope/visible-objects")
  }

  // Telescope API methods
  async getTelescopeStatus(): Promise<TelescopeStatus> {
    const response = await this.request<RawTelescopeResponse>("/api/telescope/status")
    return this.validateTelescopeStatus(response)
  }

  async connectTelescope(connected: boolean): Promise<TelescopeStatus> {
    const response = await this.request<RawTelescopeResponse>("/api/telescope/connect", {
      method: "POST",
      body: JSON.stringify({ connected }),
    })
    return this.validateTelescopeStatus(response)
  }

  async setTelescopeTracking(on: boolean): Promise<TelescopeStatus> {
    const response = await this.request<RawTelescopeResponse>("/api/telescope/tracking", {
      method: "POST",
      body: JSON.stringify({ on }),
    })
    return this.validateTelescopeStatus(response)
  }

  async parkTelescope(action: "park" | "unpark"): Promise<TelescopeStatus> {
    const response = await this.request<RawTelescopeResponse>("/api/telescope/park", {
      method: "POST",
      body: JSON.stringify({ action }),
    })
    return this.validateTelescopeStatus(response)
  }

  async unparkTelescope(): Promise<TelescopeStatus> {
    return this.parkTelescope("unpark")
  }

  async slewToCoordinates(ra: number, dec: number): Promise<TelescopeStatus> {
    const response = await this.request<RawTelescopeResponse>("/api/telescope/slew/coords", {
      method: "POST",
      body: JSON.stringify({ ra, dec }),
    })
    return this.validateTelescopeStatus(response)
  }

  async getSpaceObjects(params?: {
    location?: string
    time?: string
    limit?: number
    type?: string
  }): Promise<SpaceObjectsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.location) searchParams.append("location", params.location)
    if (params?.time) searchParams.append("time", params.time)
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.type) searchParams.append("type", params.type)

    const queryString = searchParams.toString()
    const endpoint = `/api/space-objects${queryString ? `?${queryString}` : ""}`

    return this.request<SpaceObjectsResponse>(endpoint)
  }

  async selectSpaceObject(objectId: string): Promise<TelescopeSelectResponse> {
    return this.request<TelescopeSelectResponse>("/api/telescope/select", {
      method: "POST",
      body: JSON.stringify({ objectId }),
    })
  }

  // Observability API methods
  async getObservabilityLogs(params?: {
    level?: string
    limit?: number
    since?: string
  }): Promise<LogsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.level) searchParams.append("level", params.level)
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.since) searchParams.append("since", params.since)

    const queryString = searchParams.toString()
    const endpoint = `/api/observability/logs${queryString ? `?${queryString}` : ""}`

    return this.request<LogsResponse>(endpoint)
  }

  async getObservabilityMetrics(): Promise<MetricsResponse> {
    return this.request<MetricsResponse>("/api/observability/metrics")
  }

  async getObservabilityTraces(): Promise<TracesResponse> {
    return this.request<TracesResponse>("/api/observability/traces")
  }

  async getObservabilityHealth(): Promise<{
    success: boolean
    status: string
    timestamp: string
    services: Record<string, string>
  }> {
    return this.request("/api/observability/health")
  }

  // Safety API methods
  async getSafetyStatus(): Promise<SafetyStatusResponse> {
    return this.request<SafetyStatusResponse>("/api/safety/status")
  }

  async getViewingWindow(): Promise<ViewingWindowResponse> {
    return this.request<ViewingWindowResponse>("/api/safety/viewing-window")
  }

  async getNextAvailableTime(): Promise<{ nextAvailable: string; reason: string }> {
    return this.request<{ nextAvailable: string; reason: string }>("/api/safety/next-available")
  }

  // Captures API methods
  async uploadCapture(formData: FormData): Promise<{ success: boolean; id: string; downloadUrl: string }> {
    const url = `${this.baseUrl}/api/captures`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Upload timed out. Please try again.")
        }
        if (error.message.includes("Failed to fetch")) {
          throw new Error("Cannot connect to server. Please check if the backend is running.")
        }
      }
      throw error
    }
  }

  async listCaptures(): Promise<{ items: Array<{
    id: string
    objectName?: string
    timestamp: string
    coordinates?: {
      ra?: number
      dec?: number
      alt?: number
      az?: number
    }
  }> }> {
    return this.request("/api/captures")
  }
}

export const apiService = new ApiService()
