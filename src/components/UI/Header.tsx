
import React from 'react';
import { Button } from '@/components/ui/button';
import ProfileBadge from './ProfileBadge';
import { User } from '../../types';
import { useToast } from '@/components/ui/use-toast';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  const { toast } = useToast();
  
  const handleCreateTask = () => {
    toast({
      title: "Create Task",
      description: "This feature will be available in the next version.",
      duration: 3000,
    });
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-md p-1">
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Chronos Flow
            </h1>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              Beta
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="default" 
              onClick={handleCreateTask}
              size="sm"
            >
              + New Task
            </Button>
            <div className="flex items-center space-x-3">
              <ProfileBadge user={user} />
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
