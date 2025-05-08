
import React from 'react';
import { User } from '../../types';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileBadgeProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
  value?: string; // Add value prop to support Select.Item usage
}

export const ProfileBadge = ({
  user,
  size = 'md',
  showTooltip = true,
  className,
  value = undefined // Default value is undefined
}: ProfileBadgeProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  // Ensure we have a valid value that's not an empty string
  const safeValue = value || user.id;

  const badge = (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: user.color }}
      data-value={safeValue} // Add data-value attribute for potential Select usage
    >
      {user.initials}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};

export default ProfileBadge;
