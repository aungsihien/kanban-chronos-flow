import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import RoleSettings from './RoleSettings';
import TagSettings from './TagSettings';
import UserSettings from './UserSettings';

const MainSettingsPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'role' | 'tag' | 'user'>('role');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Sidebar navigation items
  const navItems = [
    { id: 'role', label: 'Roles' },
    { id: 'tag', label: 'Tags' },
    { id: 'user', label: 'Users' }
  ];

  // Function to render the title based on active section
  const getTitle = () => {
    switch (activeSection) {
      case 'role': return 'Roles';
      case 'tag': return 'Tags';
      case 'user': return 'Users';
      default: return 'Settings';
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-48 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4"></h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as 'role' | 'tag' | 'user')}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${activeSection === item.id ? 'bg-gray-100 dark:bg-gray-800 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">{getTitle()}</h1>
            <div className="ml-4 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {activeSection === 'role' ? '4' : activeSection === 'tag' ? '7' : '12'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
             
            </div>
            
            {activeSection === 'role' && (
              <Button 
                size="sm" 
                onClick={() => setIsCreatingRole(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>New Role</span>
              </Button>
            )}
            
            {activeSection === 'tag' && (
              <Button 
                size="sm" 
                onClick={() => setIsCreatingTag(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>New Tag</span>
              </Button>
            )}
            
            {activeSection === 'user' && (
              <Button 
                size="sm" 
                onClick={() => setIsCreatingUser(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>New User</span>
              </Button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {activeSection === 'role' && 
            <RoleSettings 
              isCreating={isCreatingRole} 
              setIsCreating={setIsCreatingRole} 
            />}
          {activeSection === 'tag' && 
            <TagSettings 
              isCreating={isCreatingTag} 
              setIsCreating={setIsCreatingTag} 
            />}
          {activeSection === 'user' && 
            <UserSettings 
              isCreating={isCreatingUser} 
              setIsCreating={setIsCreatingUser} 
            />}
        </div>
      </div>
    </div>
  );
};

export default MainSettingsPanel;
