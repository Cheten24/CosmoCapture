import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Shield, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { useSafety } from '../contexts/SafetyContext';
import type { SafetyStatusType } from '../types/safety';

interface ControlLockOverlayProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean; // Allow manual override
}

const ControlLockOverlay: React.FC<ControlLockOverlayProps> = ({ 
  children, 
  className = '',
  disabled = false 
}) => {
  const { safetyStatus, loading, error } = useSafety();
  const [stableStatus, setStableStatus] = useState(safetyStatus);
  const [stableError, setStableError] = useState(error);
  const [stableLoading, setStableLoading] = useState(loading);

  // Debounce status changes to prevent jittering
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setStableStatus(safetyStatus);
      setStableError(error);
      setStableLoading(loading);
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [safetyStatus, error, loading]);

  // Determine if controls should be locked using stable values
  const isLocked = !disabled && (
    stableLoading || 
    stableError || 
    !stableStatus || 
    stableStatus.status !== 'ACTIVE'
  );

  // Get lock configuration based on status
  const getLockConfig = (status: SafetyStatusType | null, isLoading: boolean, hasError: boolean) => {
    if (isLoading) {
      return {
        icon: Shield,
        color: 'text-slate-400',
        bgColor: 'bg-slate-900/80',
        title: 'Loading Safety Status',
        message: 'Please wait while we check telescope safety...',
        showSpinner: true
      };
    }

    if (hasError) {
      return {
        icon: AlertCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-900/80',
        title: 'Safety Check Failed',
        message: 'Unable to verify telescope safety. Controls are locked for safety.',
        showSpinner: false
      };
    }

    switch (status) {
      case 'UNSAFE':
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-900/80',
          title: 'Telescope Locked - Unsafe Conditions',
          message: 'Weather conditions are unsafe for telescope operation.',
          showSpinner: false
        };
      case 'CLOSED':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/80',
          title: 'Telescope Locked - Outside Viewing Hours',
          message: 'Telescope is only available during nighttime viewing windows.',
          showSpinner: false
        };
      case 'ACTIVE':
        return {
          icon: Unlock,
          color: 'text-green-400',
          bgColor: 'bg-green-900/80',
          title: 'Telescope Active',
          message: 'Controls are available for use.',
          showSpinner: false
        };
      default:
        return {
          icon: Lock,
          color: 'text-slate-400',
          bgColor: 'bg-slate-900/80',
          title: 'Telescope Locked',
          message: 'Safety status unknown. Controls are locked for safety.',
          showSpinner: false
        };
    }
  };

  const lockConfig = getLockConfig(stableStatus?.status || null, stableLoading, !!stableError);

  return (
    <div className={`relative ${className}`}>
      {/* Main content */}
      <div className={isLocked ? 'pointer-events-none select-none' : ''}>
        {children}
      </div>

      {/* Lock overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 ${lockConfig.bgColor} backdrop-blur-sm rounded-xl flex items-center justify-center z-50`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-slate-800/90 border border-slate-600 rounded-lg p-6 max-w-sm mx-4 text-center shadow-2xl"
            >
              {/* Icon with optional spinner */}
              <div className="flex items-center justify-center mb-4">
                {lockConfig.showSpinner ? (
                  <div className="relative">
                    <lockConfig.icon className={`h-12 w-12 ${lockConfig.color}`} />
                    <div className="absolute inset-0 animate-spin">
                      <div className="h-12 w-12 border-2 border-transparent border-t-slate-400 rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: safetyStatus?.status === 'UNSAFE' ? [0, -5, 5, 0] : 0
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatType: 'reverse' 
                    }}
                  >
                    <lockConfig.icon className={`h-12 w-12 ${lockConfig.color}`} />
                  </motion.div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2">
                {lockConfig.title}
              </h3>

              {/* Message */}
              <p className="text-sm text-slate-300 mb-4">
                {lockConfig.message}
              </p>

              {/* Additional info based on status */}
              {stableStatus && stableStatus.status !== 'ACTIVE' && (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  {stableStatus.reason && (
                    <p className="text-xs text-slate-400 mb-2">
                      <strong>Reason:</strong> {stableStatus.reason}
                    </p>
                  )}
                  
                  {stableStatus.nextAvailable && (
                    <p className="text-xs text-slate-400">
                      <strong>Next Available:</strong>{' '}
                      {new Date(stableStatus.nextAvailable).toLocaleString('en-AU', {
                        timeZone: 'Australia/Melbourne',
                        hour12: true,
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Error details */}
              {stableError && (
                <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30 mt-3">
                  <p className="text-xs text-red-300">
                    <strong>Error:</strong> {stableError}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ControlLockOverlay;