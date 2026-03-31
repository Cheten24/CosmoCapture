/**
 * Icon mapping constants for consistent usage across components
 * Combines React Icons (react-icons) with existing Lucide React icons
 */

import React from 'react';

// React Icons imports
import { 
  FiActivity, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiClock, 
  FiEye, 
  FiEyeOff, 
  FiLock, 
  FiUnlock, 
  FiShield,
  FiSun,
  FiMoon,
  FiCalendar,
  FiThermometer,
  FiWind,
  FiCloudRain,
  FiStar,
  FiCircle
} from 'react-icons/fi'; // Feather icons

import { 
  MdVisibility, 
  MdVisibilityOff, 
  MdPublic,
  MdBrightness2,
  MdWbSunny
} from 'react-icons/md'; // Material Design icons

import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  Sun,
  Moon,
  Calendar,
  Thermometer,
  Wind,
  CloudRain,
  Star,
  Telescope
} from 'lucide-react'; // Lucide icons (already installed)

// Safety Status Icons
export const SafetyStatusIcons = {
  ACTIVE: {
    feather: FiCheckCircle,
    lucide: CheckCircle,
    material: MdVisibility
  },
  UNSAFE: {
    feather: FiAlertTriangle,
    lucide: AlertTriangle,
    material: MdVisibilityOff
  },
  CLOSED: {
    feather: FiClock,
    lucide: Clock,
    material: MdBrightness2
  }
} as const;

// Weather Condition Icons
export const WeatherIcons = {
  activity: {
    feather: FiActivity,
    lucide: Activity
  },
  cloudRain: {
    feather: FiCloudRain,
    lucide: CloudRain
  },
  wind: {
    feather: FiWind,
    lucide: Wind
  },
  thermometer: {
    feather: FiThermometer,
    lucide: Thermometer
  },
  sun: {
    feather: FiSun,
    lucide: Sun,
    material: MdWbSunny
  },
  moon: {
    feather: FiMoon,
    lucide: Moon,
    material: MdBrightness2
  }
} as const;

// Object Type Icons
export const ObjectTypeIcons = {
  star: {
    feather: FiStar,
    lucide: Star
  },
  planet: {
    feather: FiCircle,
    material: MdPublic
  },
  telescope: {
    lucide: Telescope
  }
} as const;

// Control and Interface Icons
export const ControlIcons = {
  lock: {
    feather: FiLock,
    lucide: Lock
  },
  unlock: {
    feather: FiUnlock,
    lucide: Unlock
  },
  shield: {
    feather: FiShield,
    lucide: Shield
  },
  eye: {
    feather: FiEye,
    lucide: Eye,
    material: MdVisibility
  },
  eyeOff: {
    feather: FiEyeOff,
    lucide: EyeOff,
    material: MdVisibilityOff
  },
  calendar: {
    feather: FiCalendar,
    lucide: Calendar
  },
  clock: {
    feather: FiClock,
    lucide: Clock
  }
} as const;

// Default icon set preference (can be changed globally)
export const DEFAULT_ICON_SET = 'lucide' as const;

// Helper function to get preferred icon
export function getIcon(iconMap: Record<string, React.ComponentType<{size?: number; className?: string}>>, preferredSet: string = DEFAULT_ICON_SET) {
  return iconMap[preferredSet] || iconMap.lucide || iconMap.feather || iconMap.material;
}

// Common icon sizes for consistency
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;

// Common icon colors matching the existing theme
export const IconColors = {
  active: 'text-green-500',
  unsafe: 'text-red-500',
  closed: 'text-yellow-500',
  neutral: 'text-slate-400',
  primary: 'text-slate-100',
  secondary: 'text-slate-300'
} as const;