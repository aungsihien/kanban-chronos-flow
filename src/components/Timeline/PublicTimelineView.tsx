import React, { useState } from 'react';
import { Task, TimeScale, Status, PublicTimelineSettings } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfQuarter, endOfQuarter, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Lock, Calendar, Info } from 'lucide-react';
import { quarters, getCurrentQuarter } from '../../data/mockData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PublicTimelineViewProps {
  tasks: Task[];
  settings: PublicTimelineSettings;
  isPublic?: boolean;
}

export const PublicTimelineView = ({
  tasks,
  settings,
  isPublic = false,
}: PublicTimelineViewProps) => {
  const [scale, setScale] = useState<TimeScale>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentQuarter, setCurrentQuarter] = useState(getCurrentQuarter());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // Filter tasks based on settings
  const filteredTasks = tasks.filter(task => 
    settings.visibleColumns.includes(task.status)
  );
  
  // Generate timeline units based on scale
  const generateTimelineUnits = () => {
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);

    switch (scale) {
      case 'day':
        return eachDayOfInterval({ start: quarterStart, end: quarterEnd });
      case 'week':
        return eachWeekOfInterval({ start: quarterStart, end: quarterEnd });
      case 'month':
        return eachMonthOfInterval({ start: quarterStart, end: quarterEnd });
      case 'quarter':
        return [quarterStart];
      default:
        return eachWeekOfInterval({ start: quarterStart, end: quarterEnd });
    }
  };

  const timelineUnits = generateTimelineUnits();

  // Format the unit label based on scale
  const formatUnitLabel = (date: Date) => {
    switch (scale) {
      case 'day':
        return format(date, 'MMM d');
      case 'week':
        return `Week ${format(date, 'w')}`;
      case 'month':
        return format(date, 'MMM');
      case 'quarter':
        return currentQuarter;
      default:
        return format(date, 'MMM d');
    }
  };

  // Position tasks in the timeline
  const positionTask = (task: Task) => {
    const taskDate = new Date(task.deadline);
    const quarterStart = startOfQuarter(currentDate);
    const totalDays = Math.floor((endOfQuarter(currentDate).getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));
    const taskDays = Math.floor((taskDate.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Position as percentage from left
    let position = (taskDays / totalDays) * 100;
    
    // Keep within bounds
    position = Math.max(0, Math.min(position, 98));
    
    return `${position}%`;
  };

  // Get color for task based on status
  const getTaskColor = (task: Task) => {
    switch (task.status) {
      case 'Backlog':
        return 'bg-gray-200 border-gray-300';
      case 'In Progress':
        return 'bg-blue-100 border-blue-300';
      case 'Review':
        return 'bg-purple-100 border-purple-300';
      case 'Done':
        return 'bg-green-100 border-green-300';
      case 'Blocked':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-l-4 border-priority-high';
      case 'Medium':
        return 'border-l-4 border-priority-medium';
      case 'Low':
        return 'border-l-4 border-priority-low';
      default:
        return '';
    }
  };

  const changeQuarter = (q: string) => {
    setCurrentQuarter(q);
    const qIndex = quarters.findIndex(quarter => quarter.name === q);
    if (qIndex >= 0) {
      const now = new Date();
      const newDate = new Date(now.getFullYear(), quarters[qIndex].startMonth, 1);
      setCurrentDate(newDate);
    }
  };
  
  const getShareableLink = () => {
    // In a real app, this would be a proper URL
    return `${window.location.origin}/timeline/public/${settings.accessKey}`;
  };
  
  const copyShareableLink = () => {
    navigator.clipboard.writeText(getShareableLink());
    // In a real app, you'd show a toast notification here
  };
  
  return (
    <div className="public-timeline-view p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {settings.title}
            {!isPublic && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-2">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This timeline is currently private</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h2>
          {settings.description && (
            <p className="text-gray-500 mt-1">{settings.description}</p>
          )}
        </div>
        
        {!isPublic && (
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Timeline
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Timeline</DialogTitle>
                <DialogDescription>
                  Anyone with the link can view this timeline without an account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Shareable Link</label>
                  <div className="flex gap-2">
                    <Input value={getShareableLink()} readOnly />
                    <Button onClick={copyShareableLink}>Copy</Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Access Key</label>
                  <div className="flex items-center gap-2">
                    <Input value={settings.accessKey} readOnly />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This key is part of the shareable link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                {settings.expiresAt && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Calendar className="h-4 w-4" />
                    <span>Expires on {format(new Date(settings.expiresAt), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <Select value={scale} onValueChange={(value) => setScale(value as TimeScale)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Scale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={currentQuarter} onValueChange={changeQuarter}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Quarter" />
            </SelectTrigger>
            <SelectContent>
              {quarters.map(q => (
                <SelectItem key={q.name} value={q.name}>{q.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isPublic && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Read-Only View
            </Badge>
          </div>
        )}
      </div>
      
      <div className="timeline-container overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="font-medium">Task</div>
            <div className="font-medium col-span-2">Timeline ({currentQuarter})</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              {filteredTasks
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                .map(task => (
                  <div key={task.id} className="h-10 flex items-center text-sm truncate">
                    <span>{task.title}</span>
                  </div>
                ))
              }
            </div>

            <div className="relative col-span-2 border rounded-md">
              {/* Timeline header */}
              <div className="flex border-b">
                {timelineUnits.map((unit, index) => (
                  <div 
                    key={index}
                    className="text-center text-xs py-2 flex-1 border-r last:border-r-0"
                  >
                    {formatUnitLabel(unit)}
                  </div>
                ))}
              </div>

              {/* Timeline grid */}
              <div className="relative min-h-[300px]">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex">
                  {timelineUnits.map((_, index) => (
                    <div key={index} className="flex-1 border-r last:border-r-0"></div>
                  ))}
                </div>

                {/* Tasks on timeline */}
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "absolute h-8 mt-1 rounded-md border text-xs flex items-center px-2",
                      getTaskColor(task),
                      getPriorityIndicator(task.priority)
                    )}
                    style={{
                      left: positionTask(task),
                      top: `${filteredTasks.indexOf(task) * 40}px`,
                      width: '120px',
                    }}
                    title={`${task.title} (Due: ${format(new Date(task.deadline), "MMM d")})`}
                  >
                    <span className="truncate flex-1">
                      {scale === 'day' ? task.title.substring(0, 10) + '...' : task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isPublic && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is a read-only view of the timeline. Contact the owner for more information.</p>
          <p className="mt-1">Created by {settings.createdBy.name} on {format(new Date(settings.createdAt), "MMM d, yyyy")}</p>
        </div>
      )}
    </div>
  );
};

export default PublicTimelineView;
