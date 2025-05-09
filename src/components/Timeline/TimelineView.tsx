import React, { useState } from 'react';
import { Task, TimeScale, User } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { quarters, getCurrentQuarter } from '../../data/mockData';
import ProfileBadge from '../UI/ProfileBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, addDays, startOfQuarter, endOfQuarter, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, parseISO } from 'date-fns';
import TaskDetail from '../UI/TaskDetail';
import { ChevronRight, ChevronDown, X } from 'lucide-react';


interface TimelineViewProps {
  tasks: Task[];
  users: User[];
}

export const TimelineView = ({ tasks, users }: TimelineViewProps) => {
  const [scale, setScale] = useState<TimeScale>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentQuarter, setCurrentQuarter] = useState(getCurrentQuarter());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('vertical');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'requirements': true,
    'design': true,
    'development': true,
    'testing': true,
    'promotion': true,
  });
  const [showNotes, setShowNotes] = useState(true);
  
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };
  
  // Group tasks by section (using scope or tags)
  const tasksBySection = {
    'requirements': tasks.filter(task => 
      task.scope?.toLowerCase().includes('requirement') || 
      task.tags.includes('Research') ||
      task.title.toLowerCase().includes('requirement')),
    'design': tasks.filter(task => 
      task.scope?.toLowerCase().includes('design') || 
      task.tags.includes('Design') ||
      task.title.toLowerCase().includes('design')),
    'development': tasks.filter(task => 
      task.scope?.toLowerCase().includes('development') || 
      task.tags.includes('Feature') ||
      task.title.toLowerCase().includes('development')),
    'testing': tasks.filter(task => 
      task.scope?.toLowerCase().includes('testing') || 
      task.tags.includes('Testing') ||
      task.title.toLowerCase().includes('test')),
    'promotion': tasks.filter(task => 
      task.scope?.toLowerCase().includes('promotion') || 
      task.title.toLowerCase().includes('release') ||
      task.title.toLowerCase().includes('launch')),
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleNotes = () => {
    setShowNotes(prev => !prev);
  };

  // Sort each section's tasks by deadline
  Object.keys(tasksBySection).forEach(section => {
    const sectionTasks = tasksBySection[section as keyof typeof tasksBySection];
    sectionTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  });

  // Section titles using proper capitalization
  const sectionTitles: Record<string, string> = {
    'requirements': 'Establish Requirements',
    'design': 'Design & Wireframes',
    'development': 'Development',
    'testing': 'Testing & QA',
    'promotion': 'Promotion & Launch'
  };
  
  // Simple mapping of section names to user names
  const sectionAssigneeMapping: Record<string, string> = {
    'requirements': 'Maria Rodriguez',
    'design': 'Katelyn Taylor',
    'development': 'James Wilson',
    'testing': 'Sarah Johnson',
    'promotion': 'Michael Chen'
  };
  
  // Notes for the sidebar
  const sectionNotes: Record<string, string[]> = {
    'requirements': [
      'Establish key features',
      'Get stakeholder feedback',
      'Document requirements'
    ],
    'design': [
      'Gather inspiration',
      'Wireframe pages',
      'Design mockups'
    ],
    'development': [
      'Set up environment',
      'Implement core features',
      'Code review'
    ],
    'testing': [
      'Unit testing',
      'Integration testing',
      'User acceptance'
    ],
    'promotion': [
      'Prepare marketing materials',
      'Social media announcements',
      'Blog post'
    ]
  };
  
  // Format weeks for a month (for the vertical timeline)
  const getWeeksInNovember = () => {
    // Mocked weeks for November 2020 (example timeline)
    return [
      new Date(2020, 10, 1), // Nov 1
      new Date(2020, 10, 8), // Nov 8
      new Date(2020, 10, 15), // Nov 15
      new Date(2020, 10, 22), // Nov 22
      new Date(2020, 10, 29), // Nov 29
    ];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mt-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold">Timeline View</h2>
        
        <div className="flex items-center space-x-2">
          <Select value={scale} onValueChange={(value) => setScale(value as TimeScale)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Scale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
          
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
      </div>


      
      <div className="timeline-container overflow-x-auto pb-4">
        <div className="min-w-[900px] flex flex-col">
          <div className="flex mb-4">
            <div className="w-[240px] font-medium">Task</div>
            <div className="w-[240px] font-medium">Owner</div>
            <div className="flex-1 font-medium">Timeline ({currentQuarter})</div>
          </div>

          <div className="flex">
            <div className="w-[240px] space-y-2 pr-4">
              {tasks
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                .map(task => (
                  <div key={task.id} className="h-10 flex items-center text-sm truncate">
                    <span>{task.title}</span>
                  </div>
                ))
              }
            </div>
            
            <div className="w-[240px] space-y-2 pr-4">
              {tasks
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                .map(task => (
                  <div key={task.id} className="h-10 flex items-center text-sm truncate">
                    {task.productOwner ? (
                      <div className="flex items-center gap-1">
                        <ProfileBadge user={task.productOwner} size="sm" showTooltip={true} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{task.productOwner.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Unassigned</span>
                    )}
                  </div>
                ))
              }
            </div>

            <div className="flex-1 relative border rounded-md">
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
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "absolute h-8 mt-1 rounded-md border text-xs flex items-center px-2 cursor-pointer hover:opacity-90 transition-all",
                      getTaskColor(task),
                      getPriorityIndicator(task.priority)
                    )}
                    style={{
                      left: positionTask(task),
                      top: `${tasks.indexOf(task) * 40}px`,
                      width: '120px',
                    }}
                    title={`${task.title} (Due: ${format(new Date(task.deadline), "MMM d")})`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <span className="truncate flex-1">
                      {scale === 'day' ? task.title.substring(0, 10) + '...' : task.title}
                    </span>
                    {task.assignee && scale !== 'day' && (
                      <ProfileBadge user={task.assignee} size="sm" showTooltip={true} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Task Detail Dialog */}
      <TaskDetail 
        task={selectedTask} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </div>
  );
};

export default TimelineView;
