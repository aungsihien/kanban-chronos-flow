
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import ProfileBadge from './ProfileBadge';
import { User } from '../../types';
import { useToast } from '@/components/ui/use-toast';
import ThemeToggle from './ThemeToggle';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

// Helper function to detect viewport width and adjust layout
const useViewportWidth = () => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    width,
    isNarrow: width < 640,
    isMedium: width >= 640 && width < 768,
    isWide: width >= 768
  };
};

export const Header = ({ user, onLogout }: HeaderProps) => {
  const { toast } = useToast();
  const viewport = useViewportWidth();
  const [showLogout, setShowLogout] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const logoutRef = useRef<HTMLDivElement>(null);
  
  const handleCreateTask = () => {
    toast({
      title: "Create Task",
      description: "This feature will be available in the next version.",
      duration: 3000,
    });
  };
  
  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };
  
  // Close logout when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current && 
        !profileRef.current.contains(event.target as Node) &&
        logoutRef.current && 
        !logoutRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <header className="bg-white shadow-sm dark:bg-gray-800 border-b w-full sticky top-0 z-40 overflow-x-auto">
        <div className="px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between min-w-[600px]">
          {/* Logo Group - Fixed width, never shrinks */}
          <div className="flex items-center space-x-2 flex-shrink-0 min-w-[180px]">
            <div className="bg-primary rounded-md p-1 flex-shrink-0">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                Chronos Flow
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 w-fit">
                Beta
              </span>
            </div>
          </div>
          
          {/* Right side controls with fixed minimum spacing */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Theme toggle - always visible */}
            <ThemeToggle className="flex-shrink-0" />
            
            {/* User profile section */}
            <div className="relative" ref={profileRef}>
              {/* User Info Button */}
              <div 
                onClick={toggleLogout}
                className="flex items-center gap-2 h-9 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <ProfileBadge user={user} />
                
                {/* Show different levels of detail based on viewport */}
                {viewport.isWide ? (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role}
                    </span>
                  </div>
                ) : viewport.isMedium ? (
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {user.initials} | {user.role}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Logout button outside header */}
      {showLogout && (
        <div 
          ref={logoutRef}
          className="absolute top-16 right-4 md:right-8 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden z-50 transition-all duration-200 transform origin-top-right"
          style={{ width: '180px' }}
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start pl-3 py-2 text-sm rounded-none flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Header;
