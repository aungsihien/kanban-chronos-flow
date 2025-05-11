import React, { useState } from 'react';
import { LayoutDashboard, CalendarRange, ChevronLeft, ChevronRight, History, Battery, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import SettingsPanel from '../Settings/SettingsPanel';

interface AppSidebarProps {
  activeView: 'board' | 'timeline' | 'retrospective' | 'team-energy' | 'settings';
  onViewChange: (view: 'board' | 'timeline' | 'retrospective' | 'team-energy' | 'settings') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AppSidebar = ({ 
  activeView, 
  onViewChange,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse
}: AppSidebarProps) => {
  // Use internal state if no external control is provided
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  
  // Determine if sidebar is controlled externally or internally
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  
  // Toggle function that respects external or internal control
  const toggleCollapse = () => {
    if (externalOnToggleCollapse) {
      externalOnToggleCollapse();
    } else {
      setInternalIsCollapsed(!internalIsCollapsed);
    }
  };
  // No longer need local settings state since it's managed by the parent component
  
  return (
    <div 
      className={cn(
        "h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col",
        "transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar edge toggle - only visible on hover */}
      <div 
        className="absolute top-0 h-full right-0 w-[5px] group z-20"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {/* Subtle vertical line that appears on hover */}
        <div 
          className="absolute top-0 right-0 h-full w-[1px] bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors duration-300"
        ></div>
        
        {/* Toggle button that appears on hover - positioned at top */}
        <div 
          className="absolute top-[26px] right-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-250 cursor-pointer"
          onClick={toggleCollapse}
        >
          <div className="bg-white dark:bg-gray-800 rounded-full p-[3px] shadow-sm border border-gray-200 dark:border-gray-700">
            {isCollapsed ? (
              <ChevronRight size={14} className="text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronLeft size={14} className="text-gray-600 dark:text-gray-300" />
            )}
          </div>
        </div>
      </div>
      
      <nav className="p-0">
        <ul className="space-y-2 mt-0 pt-0 px-2">
          <li>
            <button
              onClick={() => onViewChange('board')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                activeView === 'board' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              title="Board"
            >
              <LayoutDashboard size={18} />
              <span className={cn(
                "transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>Board</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('timeline')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                activeView === 'timeline' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              title="Timeline"
            >
              <CalendarRange size={18} />
              <span className={cn(
                "transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>Timeline</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('retrospective')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                activeView === 'retrospective' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              title="Retrospective"
            >
              <History size={18} />
              <span className={cn(
                "transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>Retrospective</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('team-energy')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                activeView === 'team-energy' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              title="Team Energy"
            >
              <Battery size={18} />
              <span className={cn(
                "transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>Team Energy</span>
            </button>
          </li>
          <li className="mt-6">
            <button
              onClick={() => onViewChange('settings')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                activeView === 'settings' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              title="Settings"
            >
              <Settings size={18} />
              <span className={cn(
                "transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>Settings</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Settings Panel no longer needed here as it's shown in the main content area */}

    </div>
  );
};

export default AppSidebar;
