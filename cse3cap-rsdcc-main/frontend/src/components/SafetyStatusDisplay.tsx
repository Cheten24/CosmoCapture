import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, Sun, Moon } from 'lucide-react';
import { useSafety } from '../contexts/SafetyContext';
import type { SafetyStatusType } from '../types/safety';

interface SafetyStatusDisplayProps {
  className?: string;
  showCountdown?: boolean;
}

const SafetyStatusDisplay: React.FC<SafetyStatusDisplayProps> = ({ 
  className = '', 
  showCountdown = true 
}) => {
  const { safetyStatus, loading, error } = useSafety();
  const [countdown, setCountdown] = useState<string>('');

  // Update countdown timer
  useEffect(() => {
    if (!safetyStatus?.nextAvailable || !showCountdown) return;

    const updateCountdown = () => {
      const now = new Date();
      const nextAvailable = new Date(safetyStatus.nextAvailable!);
      const diff = nextAvailable.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Available now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [safetyStatus?.nextAvailable, showCountdown]);

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
    if (!safetyStatus) return Sun;
    
    const currentTime = new Date(safetyStatus.currentTime);
    const viewingStart = new Date(safetyStatus.viewingWindow.start);
    const viewingEnd = new Date(safetyStatus.viewingWindow.end);
    
    // Check if current time is within viewing window
    const isNightTime = currentTime >= viewingStart || currentTime <= viewingEnd;
    return isNightTime ? Moon : Sun;
  };

  if (loading) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
          <span className="ml-3 text-slate-400">Loading safety status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 shadow-xl ${className}`}>
        <div className="flex items-center text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span className="text-sm">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!safetyStatus) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl ${className}`}>
        <div className="flex items-center text-slate-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span className="text-sm">No safety status available</span>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(safetyStatus.status);
  const TimeIcon = getTimeIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-slate-800/50 backdrop-blur-sm border ${statusConfig.borderColor} rounded-xl p-6 shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-600 pb-3">
        <h3 className="text-xl font-bold text-white">Safety Status</h3>
        <div className="flex items-center text-slate-400">
          <TimeIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {safetyStatus.currentTime ? 
              new Date(safetyStatus.currentTime).toLocaleTimeString('en-AU', {
                timeZone: 'Australia/Melbourne',
                hour12: true,
                hour: 'numeric',
                minute: '2-digit'
              }) : 
              'N/A'
            }
          </span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`${statusConfig.bgColor} rounded-lg p-4 mb-4`}>
        <div className="flex items-center mb-2">
          <statusConfig.icon className={`h-6 w-6 ${statusConfig.color} mr-3`} />
          <div>
            <h4 className={`text-lg font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </h4>
            <p className="text-sm text-slate-300">
              {statusConfig.description}
            </p>
          </div>
        </div>
        
        {/* Reason */}
        {safetyStatus.reason && (
          <p className="text-sm text-slate-400 mt-2">
            {safetyStatus.reason}
          </p>
        )}
      </div>

      {/* Countdown Timer */}
      {showCountdown && safetyStatus.status !== 'ACTIVE' && safetyStatus.nextAvailable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-300">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Next Available</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-white">
                {countdown}
              </div>
              <div className="text-xs text-slate-400">
                {new Date(safetyStatus.nextAvailable).toLocaleString('en-AU', {
                  timeZone: 'Australia/Melbourne',
                  hour12: true,
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Viewing Window Info */}
      {safetyStatus.status === 'ACTIVE' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-500/5 rounded-lg p-4 border border-green-500/20"
        >
          <div className="flex items-center text-green-400 mb-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Current Viewing Window</span>
          </div>
          <div className="text-xs text-slate-400">
            {new Date(safetyStatus.viewingWindow.start).toLocaleTimeString('en-AU', {
              timeZone: 'Australia/Melbourne',
              hour12: true,
              hour: 'numeric',
              minute: '2-digit'
            })} - {new Date(safetyStatus.viewingWindow.end).toLocaleTimeString('en-AU', {
              timeZone: 'Australia/Melbourne',
              hour12: true,
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SafetyStatusDisplay;