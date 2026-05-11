import React from 'react';
import { WeatherIcons, getIcon, IconSizes, IconColors } from '../../lib/icons';

export type WeatherCondition = 'activity' | 'cloudRain' | 'wind' | 'thermometer' | 'sun' | 'moon';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: keyof typeof IconSizes;
  className?: string;
  iconSet?: 'feather' | 'lucide' | 'material';
  color?: keyof typeof IconColors;
}

/**
 * WeatherIcon component for different weather conditions
 * Supports activity, cloudRain, wind, thermometer, sun, and moon icons
 */
export const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  condition, 
  size = 'md', 
  className = '',
  iconSet = 'lucide',
  color = 'primary'
}) => {
  const IconComponent = getIcon(WeatherIcons[condition], iconSet);
  const iconColor = IconColors[color];
  const iconSize = IconSizes[size];

  if (!IconComponent) {
    console.warn(`No icon found for weather condition: ${condition} with iconSet: ${iconSet}`);
    return null;
  }

  return (
    <IconComponent 
      size={iconSize}
      className={`${iconColor} ${className}`}
      aria-label={`Weather: ${condition}`}
    />
  );
};

export default WeatherIcon;