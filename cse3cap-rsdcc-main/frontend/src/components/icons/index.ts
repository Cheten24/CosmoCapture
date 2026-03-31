/**
 * Icon components for consistent usage across the telescope safety scheduling system
 */

export { StatusIcon, type SafetyStatus } from './StatusIcon';
export { WeatherIcon, type WeatherCondition } from './WeatherIcon';
export { ObjectTypeIcon, type ObjectType } from './ObjectTypeIcon';

// Re-export icon utilities for convenience
export { 
  SafetyStatusIcons, 
  WeatherIcons, 
  ObjectTypeIcons, 
  ControlIcons,
  getIcon, 
  IconSizes, 
  IconColors,
  DEFAULT_ICON_SET 
} from '../../lib/icons';