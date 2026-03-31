import React from 'react';
import { ObjectTypeIcons, getIcon, IconSizes, IconColors } from '../../lib/icons';

export type ObjectType = 'star' | 'planet' | 'telescope';

interface ObjectTypeIconProps {
  type: ObjectType;
  size?: keyof typeof IconSizes;
  className?: string;
  iconSet?: 'feather' | 'lucide' | 'material';
  color?: keyof typeof IconColors;
}

/**
 * ObjectTypeIcon component for celestial object types
 * Supports star, planet, and telescope icons with consistent styling
 */
export const ObjectTypeIcon: React.FC<ObjectTypeIconProps> = ({ 
  type, 
  size = 'md', 
  className = '',
  iconSet = 'lucide',
  color = 'primary'
}) => {
  const IconComponent = getIcon(ObjectTypeIcons[type], iconSet);
  const iconColor = IconColors[color];
  const iconSize = IconSizes[size];

  if (!IconComponent) {
    console.warn(`No icon found for object type: ${type} with iconSet: ${iconSet}`);
    return null;
  }

  return (
    <IconComponent 
      size={iconSize}
      className={`${iconColor} ${className}`}
      aria-label={`Object type: ${type}`}
    />
  );
};

export default ObjectTypeIcon;