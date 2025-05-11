import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import RoleSettings from './RoleSettings';
import TagSettings from './TagSettings';
import UserSettings from './UserSettings';

interface SettingsPanelProps {
  isCollapsed: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isCollapsed }) => {
  const [activeTab, setActiveTab] = useState<'role' | 'tag' | 'user'>('role');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  if (isCollapsed) {
    return (
      <div className="absolute bottom-20 left-0 w-full px-2 py-4">
        <button
          className="w-full flex justify-center items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Settings"
        >
          <Settings size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-0 w-full px-4 py-2">
      <Card className="w-full border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings size={16} />
            
          </CardTitle>
          <CardDescription className="text-xs">
            Manage roles, tags, and users
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs 
            defaultValue="role" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'role' | 'tag' | 'user')}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 h-9 bg-gray-100 dark:bg-gray-800 rounded-none">
              <TabsTrigger 
                value="role" 
                className={cn(
                  "text-xs h-9 data-[state=active]:shadow-none",
                  "data-[state=active]:border-b-2 data-[state=active]:border-primary"
                )}
              >
                Role
              </TabsTrigger>
              <TabsTrigger 
                value="tag" 
                className={cn(
                  "text-xs h-9 data-[state=active]:shadow-none",
                  "data-[state=active]:border-b-2 data-[state=active]:border-primary"
                )}
              >
                Tag
              </TabsTrigger>
              <TabsTrigger 
                value="user" 
                className={cn(
                  "text-xs h-9 data-[state=active]:shadow-none",
                  "data-[state=active]:border-b-2 data-[state=active]:border-primary"
                )}
              >
                User
              </TabsTrigger>
            </TabsList>
            <TabsContent value="role" className="p-3 pt-4">
              <RoleSettings isCreating={isCreatingRole} setIsCreating={setIsCreatingRole} />
            </TabsContent>
            <TabsContent value="tag" className="p-3 pt-4">
              <TagSettings isCreating={isCreatingTag} setIsCreating={setIsCreatingTag} />
            </TabsContent>
            <TabsContent value="user" className="p-3 pt-4">
              <UserSettings isCreating={isCreatingUser} setIsCreating={setIsCreatingUser} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
