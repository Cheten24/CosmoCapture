/**
 * Enhanced object visibility types for telescope safety scheduling system
 */

export interface VisibleObject {
  name: string;
  type: string;
  coordinates: {
    ra: number;
    dec: number;
    alt: number;
    az: number;
  };
  visibility: {
    isVisible: boolean;
    elevation: number;
    magnitude?: number;
    riseTime?: Date;
    setTime?: Date;
  };
  metadata: {
    constellation?: string;
    distance?: string;
    description?: string;
  };
}

export interface ObjectVisibilityFilter {
  minElevation?: number;
  objectTypes?: string[];
  constellations?: string[];
  magnitudeRange?: {
    min: number;
    max: number;
  };
}

export interface VisibilityTimelineData {
  time: Date;
  elevation: number;
  isVisible: boolean;
}