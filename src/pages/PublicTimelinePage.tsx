import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockTasks } from '../data/mockData';
import { Task, PublicTimelineSettings } from '../types';
import PublicTimelineView from '../components/Timeline/PublicTimelineView';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

// Mock public timeline settings for demonstration
const mockPublicTimelineSettings: PublicTimelineSettings[] = [
  {
    id: 'timeline-1',
    accessKey: 'abc123',
    title: 'Product Roadmap Q2 2025',
    description: 'Public view of our product roadmap for external stakeholders',
    createdBy: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Product Manager',
      initials: 'JD',
      color: '#4f46e5',
    },
    createdAt: '2025-04-01T00:00:00Z',
    expiresAt: '2025-07-01T00:00:00Z',
    allowedFilters: true,
    visibleColumns: ['Backlog', 'In Progress', 'Review', 'Done'],
    hiddenTasks: ['task-3', 'task-7'], // Tasks with sensitive information
    isPasswordProtected: true,
    password: 'demo123',
    isPublic: true,
  },
  {
    id: 'timeline-2',
    accessKey: 'def456',
    title: 'Marketing Campaign Timeline',
    description: 'Timeline for our upcoming marketing initiatives',
    createdBy: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Marketing Director',
      initials: 'JS',
      color: '#10b981',
    },
    createdAt: '2025-04-15T00:00:00Z',
    allowedFilters: false,
    visibleColumns: ['Backlog', 'In Progress', 'Done'],
    hiddenTasks: [],
    isPasswordProtected: false,
    isPublic: true,
  }
];

const PublicTimelinePage = () => {
  const { accessKey } = useParams<{ accessKey: string }>();
  const [timelineSettings, setTimelineSettings] = useState<PublicTimelineSettings | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would be an API call to fetch the timeline settings
    const settings = mockPublicTimelineSettings.find(s => s.accessKey === accessKey);
    
    if (settings) {
      setTimelineSettings(settings);
      
      // Check if the timeline has expired
      if (settings.expiresAt) {
        const expiryDate = new Date(settings.expiresAt);
        if (expiryDate < new Date()) {
          setIsExpired(true);
        }
      }
      
      // If not password protected, authenticate immediately
      if (!settings.isPasswordProtected) {
        setIsAuthenticated(true);
      }
      
      // Filter tasks based on settings
      const filtered = mockTasks
        .filter(task => settings.visibleColumns.includes(task.status))
        .filter(task => !settings.hiddenTasks.includes(task.id));
      
      setFilteredTasks(filtered);
    }
    
    setIsLoading(false);
  }, [accessKey]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (timelineSettings?.password === password) {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "You now have access to the timeline view.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Access Denied",
        description: "The password you entered is incorrect.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!timelineSettings) {
    return (
      <div className="container mx-auto p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Timeline Not Found</CardTitle>
            <CardDescription>
              The timeline you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="container mx-auto p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Timeline Access Expired
            </CardTitle>
            <CardDescription>
              This shared timeline link has expired and is no longer accessible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              The link expired on {timelineSettings.expiresAt && format(new Date(timelineSettings.expiresAt), "MMMM d, yyyy")}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated && timelineSettings.isPasswordProtected) {
    return (
      <div className="container mx-auto p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Password Protected Timeline
            </CardTitle>
            <CardDescription>
              This timeline requires a password to access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <Button type="submit">Access Timeline</Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-xs text-gray-500">
              Created by {timelineSettings.createdBy.name}
            </div>
            {timelineSettings.expiresAt && (
              <div className="text-xs text-amber-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Expires {format(new Date(timelineSettings.expiresAt), "MMM d, yyyy")}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PublicTimelineView
        tasks={filteredTasks}
        settings={timelineSettings}
        isPublic={true}
      />
    </div>
  );
};

export default PublicTimelinePage;
