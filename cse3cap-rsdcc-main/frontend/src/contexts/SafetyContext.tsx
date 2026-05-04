import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import type { SafetyStatusResponse } from '../services/api';

interface SafetyContextType {
  safetyStatus: SafetyStatusResponse | null;
  loading: boolean;
  error: string | null;
  refreshSafetyStatus: () => Promise<void>;
  lastUpdated: Date | null;
  retryCount: number;
  isRetrying: boolean;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

interface SafetyProviderProps {
  children: React.ReactNode;
  updateInterval?: number; // Update interval in milliseconds
  maxRetries?: number; // Maximum retry attempts
  retryDelay?: number; // Delay between retries in milliseconds
}

export const SafetyProvider: React.FC<SafetyProviderProps> = ({ 
  children, 
  updateInterval = 45000, // Increased to 45 seconds to reduce load
  maxRetries = 2, // Reduced retries to prevent spam
  retryDelay = 10000 // Increased delay to 10 seconds
}) => {
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const lastErrorRef = useRef<string | null>(null);

  const refreshSafetyStatus = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setError(null);
        setRetryCount(0);
      }
      
      const status = await apiService.getSafetyStatus();
      setSafetyStatus(status);
      setLastUpdated(new Date());
      setRetryCount(0);
      setIsRetrying(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch safety status';
      
      // Only update error state if it's different to prevent jittering
      if (lastErrorRef.current !== errorMessage) {
        setError(errorMessage);
        lastErrorRef.current = errorMessage;
      }
      
      console.error('Error fetching safety status:', err);
      
      // Implement retry logic with exponential backoff to prevent rapid retries
      if (retryCount < maxRetries && !isRetrying) {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        
        // Exponential backoff: 5s, 10s, 20s
        const backoffDelay = retryDelay * Math.pow(2, retryCount);
        
        setTimeout(() => {
          refreshSafetyStatus(true);
        }, backoffDelay);
      } else {
        setIsRetrying(false);
        // Set a stable error state when all retries are exhausted
        setError('Cannot connect to telescope server. Please check if the backend is running on the correct port.');
      }
    } finally {
      if (!isRetrying) {
        setLoading(false);
      }
    }
  }, [retryCount, maxRetries, retryDelay, isRetrying]); // Removed 'error' to prevent infinite loops

  // Initial fetch and periodic updates
  useEffect(() => {
    refreshSafetyStatus();
    
    const interval = setInterval(refreshSafetyStatus, updateInterval);
    return () => clearInterval(interval);
  }, [refreshSafetyStatus, updateInterval]);

  // Handle visibility change to refresh when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshSafetyStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshSafetyStatus]);

  const value: SafetyContextType = {
    safetyStatus,
    loading,
    error,
    refreshSafetyStatus: () => refreshSafetyStatus(false),
    lastUpdated,
    retryCount,
    isRetrying
  };

  return (
    <SafetyContext.Provider value={value}>
      {children}
    </SafetyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSafety = (): SafetyContextType => {
  const context = useContext(SafetyContext);
  if (context === undefined) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};