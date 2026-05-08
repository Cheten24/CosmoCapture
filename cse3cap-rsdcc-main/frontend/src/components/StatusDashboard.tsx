import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Sun, 
  Moon,
  Eye,
  Telescope
} from 'lucide-react';
import { apiService } from '../services/api';
import { useSafety } from '../contexts/SafetyContext';
import type { ViewingWindowResponse, WeatherData } from '../services/api';
import type { SafetyStatusType } from '../types/safety';

interface StatusDashboardProps {
  className?: string;
}

interface DashboardData {
  viewingWindow: ViewingWindowResponse | null;
  weatherData: WeatherData | null;
}

const StatusDashboard: React.FC<StatusDashboardProps> = ({ className = '' }) => {
  const { safetyStatus, loading: safetyLoading, error: safetyError } = useSafety();
  const [data, setData] = useState<DashboardData>({
    viewingWindow: null,
    weatherData: null
  });

  // Individual loading states and errors for each API
  const [viewingLoading, setViewingLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [viewingError, setViewingError] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Timeout wrapper with proper error handling
  const withTimeout = useCallback(async <T,>(
    promise: Promise<T>, 
    timeoutMs: number = 8000, 
    label: string = 'request'
  ): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const result = await promise;
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`${label} timed out after ${timeoutMs}ms`);
      }
      throw error;
    }
  }, []);

  // Fetch viewing window independently
  const fetchViewingWindow = useCallback(async () => {
    setViewingLoading(true);
    setViewingError(null);
    
    try {
      const viewingWindow = await withTimeout(
        apiService.getViewingWindow(),
        8000,
        'Viewing Window API'
      );
      setData(prev => ({ ...prev, viewingWindow }));
      console.log('[Dashboard] Viewing window loaded successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch viewing window';
      setViewingError(errorMsg);
      console.error('[Dashboard] Viewing window failed:', errorMsg);
    } finally {
      setViewingLoading(false);
    }
  }, [withTimeout]);

  // Fetch weather data independently  
  const fetchWeatherData = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    
    try {
      const weatherData = await withTimeout(
        apiService.getWeatherData(),
        7000,
        'Weather API'
      );
      setData(prev => ({ ...prev, weatherData }));
      console.log('[Dashboard] Weather data loaded successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setWeatherError(errorMsg);
      console.error('[Dashboard] Weather data failed:', errorMsg);
    } finally {
      setWeatherLoading(false);
    }
  }, [withTimeout]);

  // Initial load - fire both independently
  useEffect(() => {
    fetchViewingWindow();
    // Stagger weather request by 300ms to avoid synchronized load
    setTimeout(fetchWeatherData, 300);
  }, [fetchViewingWindow, fetchWeatherData]);

  // Background refresh every 60 seconds with staggered requests
  useEffect(() => {
    const interval = setInterval(() => {
      fetchViewingWindow();
      setTimeout(fetchWeatherData, 300);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchViewingWindow, fetchWeatherData]);

  // Overall loading state - only true if both are loading initially
  const overallLoading = (viewingLoading && weatherLoading) && !data.viewingWindow && !data.weatherData;

  // Get status configuration
  const getStatusConfig = (status: SafetyStatusType) => {
    switch (status) {
      case 'ACTIVE':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          label: 'Active',
          description: 'Telescope is available for use'
        };
      case 'UNSAFE':
        return {
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          label: 'Unsafe',
          description: 'Offline due to bad weather conditions'
        };
      case 'CLOSED':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          label: 'Closed',
          description: 'Outside viewing hours'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/20',
          label: 'Unknown',
          description: 'Status unavailable'
        };
    }
  };

  // Get time of day icon
  const getTimeIcon = () => {
    if (!safetyStatus || !safetyStatus.viewingWindow) return Sun;
    
    try {
      const currentTime = new Date(safetyStatus.currentTime);
      const viewingStart = new Date(safetyStatus.viewingWindow.start);
      const viewingEnd = new Date(safetyStatus.viewingWindow.end);
      
      // Check if current time is within viewing window
      const isNightTime = currentTime >= viewingStart || currentTime <= viewingEnd;
      return isNightTime ? Moon : Sun;
    } catch (error) {
      console.warn('Error parsing time data:', error);
      return Sun;
    }
  };

  // Only show full loading screen if nothing has loaded yet
  if (overallLoading && safetyLoading) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
          <span className="ml-3 text-slate-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Show critical safety error if safety system is completely down
  if (safetyError && !safetyStatus) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 shadow-xl ${className}`}>
        <div className="flex items-center text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span className="text-sm">Safety System Error: {safetyError}</span>
        </div>
      </div>
    );
  }

  const statusConfig = safetyStatus ? getStatusConfig(safetyStatus.status) : null;
  const TimeIcon = getTimeIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-600 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Activity className="h-6 w-6 mr-3 text-blue-400" />
          System Status Dashboard
        </h2>
        <div className="flex items-center text-slate-400">
          <TimeIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {(() => {
              try {
                return safetyStatus?.currentTime ? 
                  new Date(safetyStatus.currentTime).toLocaleTimeString('en-AU', {
                    timeZone: 'Australia/Melbourne',
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit'
                  }) : 
                  'N/A';
              } catch (error) {
                console.warn('Error formatting time:', error);
                return 'N/A';
              }
            })()}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Safety Status Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Status */}
          {statusConfig && safetyStatus && (
            <div className={`${statusConfig.bgColor} rounded-lg p-4 border ${statusConfig.borderColor}`}>
              <div className="flex items-center mb-3">
                <statusConfig.icon className={`h-6 w-6 ${statusConfig.color} mr-3`} />
                <div>
                  <h3 className={`text-lg font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
              
              {safetyStatus.reason && (
                <p className="text-sm text-slate-400 mb-3">
                  {safetyStatus.reason}
                </p>
              )}

              {/* Next Available Time */}
              {safetyStatus.status !== 'ACTIVE' && safetyStatus.nextAvailable && (
                <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center text-slate-300">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Next Available</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {(() => {
                        try {
                          return new Date(safetyStatus.nextAvailable).toLocaleString('en-AU', {
                            timeZone: 'Australia/Melbourne',
                            hour12: true,
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          });
                        } catch (error) {
                          console.warn('Error formatting next available time:', error);
                          return 'Unknown';
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Viewing Window Timeline - Independent Loading/Error States */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                <h4 className="text-lg font-semibold text-white">Viewing Schedule</h4>
              </div>
              {viewingLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              )}
            </div>
            
            {viewingError ? (
              <div className="space-y-3">
                <div className="flex items-center text-red-400">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Viewing schedule unavailable</span>
                </div>
                <p className="text-xs text-red-300">{viewingError}</p>
                
                {/* Show fallback schedule based on safety status */}
                {safetyStatus && safetyStatus.nextAvailable && (
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-slate-300">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Next Available</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">
                          {(() => {
                            try {
                              return new Date(safetyStatus.nextAvailable).toLocaleString('en-AU', {
                                timeZone: 'Australia/Melbourne',
                                hour12: true,
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              });
                            } catch (error) {
                              console.warn('Error formatting fallback next available time:', error);
                              return 'Unknown';
                            }
                          })()}
                        </div>
                        <div className="text-xs text-slate-400">
                          {safetyStatus.status === 'CLOSED' ? 'Nighttime viewing' : 'When conditions improve'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={fetchViewingWindow}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Retry viewing schedule
                </button>
              </div>
            ) : data.viewingWindow ? (
              
              <div className="space-y-3">
                {/* Current Window */}
                {data.viewingWindow.current && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center">
                      <Eye className={`h-4 w-4 mr-2 ${data.viewingWindow.current.isActive ? 'text-green-400' : 'text-slate-400'}`} />
                      <span className="text-sm text-slate-300">Current Window</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        {(() => {
                          try {
                            const startTime = new Date(data.viewingWindow.current.start).toLocaleTimeString('en-AU', {
                              timeZone: 'Australia/Melbourne',
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit'
                            });
                            const endTime = new Date(data.viewingWindow.current.end).toLocaleTimeString('en-AU', {
                              timeZone: 'Australia/Melbourne',
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit'
                            });
                            return `${startTime} - ${endTime}`;
                          } catch (error) {
                            console.warn('Error formatting current window times:', error);
                            return 'Time unavailable';
                          }
                        })()}
                      </div>
                      <div className={`text-xs ${data.viewingWindow.current.isActive ? 'text-green-400' : 'text-slate-400'}`}>
                        {data.viewingWindow.current.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Window */}
                {data.viewingWindow.next && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="text-sm text-slate-300">Next Window</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        {(() => {
                          try {
                            const startTime = new Date(data.viewingWindow.next.start).toLocaleTimeString('en-AU', {
                              timeZone: 'Australia/Melbourne',
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit'
                            });
                            const endTime = new Date(data.viewingWindow.next.end).toLocaleTimeString('en-AU', {
                              timeZone: 'Australia/Melbourne',
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit'
                            });
                            return `${startTime} - ${endTime}`;
                          } catch (error) {
                            console.warn('Error formatting next window times:', error);
                            return 'Time unavailable';
                          }
                        })()}
                      </div>
                      <div className="text-xs text-slate-400">
                        {(() => {
                          try {
                            return new Date(data.viewingWindow.next.start).toLocaleDateString('en-AU', {
                              timeZone: 'Australia/Melbourne',
                              month: 'short',
                              day: 'numeric'
                            });
                          } catch (error) {
                            console.warn('Error formatting next window date:', error);
                            return 'Date unavailable';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sun Times */}
                {data.viewingWindow.sunset && data.viewingWindow.sunrise && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2 text-yellow-400" />
                        <span className="text-xs text-slate-300">Sunset</span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {(() => {
                          try {
                            return new Date(data.viewingWindow.sunset).toLocaleTimeString('en-AU', {
                              timeZone: 'Australia/Melbourne',
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit'
                            });
                          } catch (error) {
                            console.warn('Error formatting sunset time:', error);
                            return 'N/A';
                          }
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2 text-orange-400" />
                        <span className="text-xs text-slate-300">Sunrise</span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {(() => {
                          try {
                            return new Date(data.viewingWindow.sunrise).toLocaleTimeString('en-AU', {
                              timeZone: 'Australia/Melbourne',
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit'
                            });
                          } catch (error) {
                            console.warn('Error formatting sunrise time:', error);
                            return 'N/A';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : !viewingLoading && safetyStatus ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-400 mb-3">
                  Detailed schedule unavailable, showing basic status
                </div>
                
                {/* Basic status from safety system */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-slate-300">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Current Status</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        safetyStatus.status === 'ACTIVE' ? 'text-green-400' : 
                        safetyStatus.status === 'UNSAFE' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {safetyStatus.status}
                      </div>
                      <div className="text-xs text-slate-400">
                        {(() => {
                          try {
                            return new Date(safetyStatus.currentTime).toLocaleTimeString('en-AU', {
                              timeZone: 'Australia/Melbourne',
                              hour12: true,
                              hour: 'numeric',
                              minute: '2-digit'
                            });
                          } catch (error) {
                            console.warn('Error formatting basic status current time:', error);
                            return 'N/A';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {safetyStatus.nextAvailable && (
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-slate-300">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Next Available</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">
                          {(() => {
                            try {
                              return new Date(safetyStatus.nextAvailable).toLocaleString('en-AU', {
                                timeZone: 'Australia/Melbourne',
                                hour12: true,
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              });
                            } catch (error) {
                              console.warn('Error formatting basic status next available time:', error);
                              return 'Unknown';
                            }
                          })()}
                        </div>
                        <div className="text-xs text-slate-400">
                          {safetyStatus.status === 'CLOSED' ? 'Nighttime viewing' : 'When conditions improve'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-400">Loading viewing schedule...</div>
            )}
          </div>
        </div>

        {/* Weather & Environment Section */}
        <div className="space-y-4">
          {/* Weather Conditions - Independent Loading/Error States */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <CloudRain className="h-5 w-5 text-blue-400 mr-2" />
                <h4 className="text-lg font-semibold text-white">Weather</h4>
              </div>
              {weatherLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              )}
            </div>
            
            {weatherError ? (
              <div className="space-y-2">
                {/* If telescope is closed due to daytime, don't emphasize weather errors */}
                {safetyStatus?.status === 'CLOSED' ? (
                  <div className="text-sm text-slate-400">
                    Weather monitoring paused during daytime
                  </div>
                ) : (
                  <>
                    <div className="flex items-center text-red-400">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Weather data unavailable</span>
                    </div>
                    <p className="text-xs text-red-300">{weatherError}</p>
                    <button 
                      onClick={fetchWeatherData}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Retry weather data
                    </button>
                  </>
                )}
              </div>
            ) : data.weatherData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-2 text-red-400" />
                    <span className="text-sm text-slate-300">Temperature</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{data.weatherData.temperature}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wind className="h-4 w-4 mr-2 text-green-400" />
                    <span className="text-sm text-slate-300">Humidity</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{data.weatherData.humidity}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-purple-400" />
                    <span className="text-sm text-slate-300">Pressure</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{data.weatherData.pressure}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CloudRain className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-sm text-slate-300">Dew Point</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{data.weatherData.dewPoint}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Loading weather data...</div>
            )}
          </div>

          {/* System Information */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center mb-3">
              <Telescope className="h-5 w-5 text-purple-400 mr-2" />
              <h4 className="text-lg font-semibold text-white">System Info</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Location</span>
                <span className="text-sm font-semibold text-white">Melbourne, AU</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Time Zone</span>
                <span className="text-sm font-semibold text-white">
                  {data.viewingWindow?.timeZone || 'AEST/AEDT'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">DST Active</span>
                <span className="text-sm font-semibold text-white">
                  {data.viewingWindow?.isDaylightSaving ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusDashboard;