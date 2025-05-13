import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ActivityResource } from '@/types/resources';

interface ActivityBadgeProps {
  activity?: ActivityResource;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// Get color based on activity ID or use activity's color property
export const getActivityColor = (activity: ActivityResource | undefined): string => {
  if (activity?.color) {
    return activity.color;
  }

  return "#4b5563";
};

export function ActivityBadge({ 
  activity, 
  size = 'md',
  showLabel = true,
  className
}: ActivityBadgeProps) {
  if (!activity) return null;
  
  const color = getActivityColor(activity);
  
  // Get activity label from the mapping or use name directly
  const label = activity.name;
  
  // Size-based styling
  const sizeClasses = {
    sm: 'h-2 w-2 mr-1',
    md: 'h-3 w-3 mr-1.5',
    lg: 'h-4 w-4 mr-2'
  };
  
  if (!showLabel) {
    return (
      <div 
        className={`rounded-full ${sizeClasses[size].split(' ').slice(0, 2).join(' ')} ${className || ''}`}
        style={{ backgroundColor: color }}
        title={label}
      />
    );
  }
    
  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center border-transparent ${className || ''}`}
      style={{ backgroundColor: color, color: 'white', borderColor: color }}
    >
      {label}
    </Badge>
  );
} 