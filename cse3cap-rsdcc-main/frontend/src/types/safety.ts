/**
 * Safety status types for telescope safety scheduling system
 */

export type SafetyStatusType = 'ACTIVE' | 'UNSAFE' | 'CLOSED';

export interface SafetyStatus {
  status: SafetyStatusType;
  reason: string;
  nextAvailable?: Date;
  currentTime: Date;
  viewingWindow: {
    start: Date;
    end: Date;
  };
}

export interface WeatherSafety {
  isSafe: boolean;
  conditions: {
    windSpeed: number;
    precipitation: boolean;
    visibility: number;
    cloudCover: number;
  };
  thresholds: {
    maxWindSpeed: number;
    maxCloudCover: number;
    minVisibility: number;
  };
}

export interface ViewingWindow {
  date: Date;
  sunrise: Date;
  sunset: Date;
  viewingStart: Date;  // 1 hour after sunset
  viewingEnd: Date;    // 1 hour before sunrise (next day)
  isDaylightSaving: boolean;
  timeZone: string;
}