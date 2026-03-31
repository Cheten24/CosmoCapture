/**
 * Object Detail Card Component
 * Displays detailed information about a celestial object with visibility data
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Star, 
  Circle, 
  Telescope, 
  Clock, 
  MapPin, 
  Info,
  ChevronDown,

  Sunrise,
  Sunset
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { VisibleObject, VisibilityTimelineData } from '../types/visibility';

interface ObjectDetailCardProps {
  object: VisibleObject;
  className?: string;
  onSelect?: (object: VisibleObject) => void;
  showTimeline?: boolean;
  expanded?: boolean;
}

const ObjectDetailCard: React.FC<ObjectDetailCardProps> = ({
  object,
  className = '',
  onSelect,
  showTimeline = true,
  expanded: controlledExpanded
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  
  // Generate mock visibility timeline data
  const generateTimelineData = (): VisibilityTimelineData[] => {
    const data: VisibilityTimelineData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hour = time.getHours();
      
      // Mock elevation calculation (higher during night hours)
      let elevation = 0;
      if (hour >= 20 || hour <= 6) {
        elevation = Math.max(0, 60 + Math.sin((hour + 12) * Math.PI / 12) * 30);
      } else {
        elevation = Math.max(0, Math.sin(hour * Math.PI / 12) * 20 - 10);
      }
      
      data.push({
        time,
        elevation,
        isVisible: elevation > 20
      });
    }
    
    return data;
  };

  const timelineData = showTimeline ? generateTimelineData() : [];

  const getObjectTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'star':
        return Star;
      case 'planet':
        return Circle;
      default:
        return Telescope;
    }
  };

  const getVisibilityStatus = () => {
    if (!object.visibility.isVisible) {
      return {
        color: 'text-slate-500',
        bgColor: 'bg-slate-700',
        status: 'Not Visible',
        icon: EyeOff
      };
    }
    
    if (object.visibility.elevation > 60) {
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-900/30',
        status: 'Excellent',
        icon: Eye
      };
    }
    
    if (object.visibility.elevation > 30) {
      return {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        status: 'Good',
        icon: Eye
      };
    }
    
    return {
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/30',
      status: 'Fair',
      icon: Eye
    };
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCoordinate = (value: number, type: 'ra' | 'dec') => {
    if (type === 'ra') {
      const hours = Math.floor(value / 15);
      const minutes = Math.floor((value / 15 - hours) * 60);
      const seconds = Math.floor(((value / 15 - hours) * 60 - minutes) * 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      const degrees = Math.floor(Math.abs(value));
      const minutes = Math.floor((Math.abs(value) - degrees) * 60);
      const seconds = Math.floor(((Math.abs(value) - degrees) * 60 - minutes) * 60);
      const sign = value >= 0 ? '+' : '-';
      return `${sign}${degrees}° ${minutes}' ${seconds}"`;
    }
  };

  const visibilityStatus = getVisibilityStatus();
  const ObjectIcon = getObjectTypeIcon(object.type);
  const StatusIcon = visibilityStatus.icon;

  const handleCardClick = () => {
    if (controlledExpanded === undefined) {
      setInternalExpanded(!expanded);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(object);
    }
  };

  return (
    <motion.div
      layout
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-200 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Main Card Content */}
      <div 
        className="p-4 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <ObjectIcon className={`h-6 w-6 ${visibilityStatus.color}`} />
              <StatusIcon className={`h-5 w-5 ${visibilityStatus.color}`} />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white">{object.name}</h3>
              <p className="text-sm text-slate-400">
                {object.type} • {object.metadata.constellation}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${visibilityStatus.bgColor} ${visibilityStatus.color}`}>
              {visibilityStatus.status}
            </div>
            
            {controlledExpanded === undefined && (
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-slate-400" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="text-center">
            <div className={`text-lg font-bold ${visibilityStatus.color}`}>
              {object.visibility.elevation.toFixed(1)}°
            </div>
            <div className="text-xs text-slate-400">Elevation</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-slate-300">
              {object.visibility.magnitude ? object.visibility.magnitude.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-slate-400">Magnitude</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-slate-300">
              {object.coordinates.az.toFixed(0)}°
            </div>
            <div className="text-xs text-slate-400">Azimuth</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-slate-300">
              {object.metadata.distance || 'Unknown'}
            </div>
            <div className="text-xs text-slate-400">Distance</div>
          </div>
        </div>

        {/* Action Button */}
        {onSelect && (
          <button
            onClick={handleSelectClick}
            disabled={!object.visibility.isVisible}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              object.visibility.isVisible
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {object.visibility.isVisible ? 'Select Object' : 'Not Currently Visible'}
          </button>
        )}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-slate-700"
          >
            <div className="p-4 space-y-4">
              {/* Detailed Coordinates */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Coordinates
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Right Ascension:</span>
                    <div className="font-mono text-slate-200">
                      {formatCoordinate(object.coordinates.ra, 'ra')}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Declination:</span>
                    <div className="font-mono text-slate-200">
                      {formatCoordinate(object.coordinates.dec, 'dec')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rise/Set Times */}
              {(object.visibility.riseTime || object.visibility.setTime) && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Visibility Times
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {object.visibility.riseTime && (
                      <div className="flex items-center space-x-2">
                        <Sunrise className="h-4 w-4 text-orange-400" />
                        <div>
                          <div className="text-slate-400">Rise Time</div>
                          <div className="font-mono text-slate-200">
                            {formatTime(object.visibility.riseTime)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {object.visibility.setTime && (
                      <div className="flex items-center space-x-2">
                        <Sunset className="h-4 w-4 text-purple-400" />
                        <div>
                          <div className="text-slate-400">Set Time</div>
                          <div className="font-mono text-slate-200">
                            {formatTime(object.visibility.setTime)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Object Description */}
              {object.metadata.description && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Description
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {object.metadata.description}
                  </p>
                </div>
              )}

              {/* Visibility Timeline */}
              {showTimeline && timelineData.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    24-Hour Visibility
                  </h4>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="time"
                          tickFormatter={(time) => new Date(time).getHours().toString()}
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <YAxis 
                          domain={[0, 90]}
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <Tooltip
                          labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                          formatter={(value: number) => [
                            `${value.toFixed(1)}°`,
                            'Elevation'
                          ]}
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F3F4F6'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="elevation"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: '#3B82F6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>Minimum elevation for visibility: 20°</span>
                    <span>Times in local timezone</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ObjectDetailCard;