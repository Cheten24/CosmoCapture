import React from 'react';
import { SafetyStatusIcons, getIcon, IconSizes, IconColors } from '../../lib/icons';

export type SafetyStatus = 'ACTIVE' | 'UNSAFE' | 'CLOSED';

interface StatusIconProps {
  status: SafetyStatus;
  size?: keyof typeof IconSizes;
  className?: string;
  iconSet?: 'feather' | 'lucide' | 'material';
}

/**
 * StatusIcon component with consistent sizing and colors for safety status display
 * Supports ACTIVE (green), UNSAFE (red), and CLOSED (yellow) states
 */
export const StatusIcon: React.FC<StatusIconProps> = ({ 
  status, 
  size = 'md', 
  className = '',
  iconSet = 'lucide'
}) => {
  const IconComponent = getIcon(SafetyStatusIcons[status], iconSet);
  
  // Get status-specific color
  const statusColor = {
    ACTIVE: IconColors.active,
    UNSAFE: IconColors.unsafe,
    CLOSED: IconColors.closed
  }[status];

  const iconSize = IconSizes[size];

  if (!IconComponent) {
    console.warn(`No icon found for status: ${status} with iconSet: ${iconSet}`);
    return null;
  }

  return (
    <IconComponent 
      size={iconSize}
      className={`${statusColor} ${className}`}
      aria-label={`Status: ${status}`}
    />
  );
};

export default StatusIcon;