
import React, { useState, useEffect } from 'react';
import { mockUsers, mockTasks, mockColumns, currentUser, quarters } from '../data/mockData';
import { FilterState, Status, Task, User, ActivityLogEntry, Theme, RetrospectiveEntry, TeamEnergyIndicator as TeamEnergyType, ThreadedComment } from '../types';
import Header from '../components/UI/Header';
import FilterBar from '../components/UI/FilterBar';
import KanbanBoard from '../components/Board/KanbanBoard';
import TimelineView from '../components/Timeline/TimelineView';
import { RetrospectiveView } from '../components/Timeline/RetrospectiveView';
import TeamEnergyPage from './TeamEnergyPage';

import LoginForm from '../components/Auth/LoginForm';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import ThemeToggle from '../components/UI/ThemeToggle';
import UnifiedSearch from '../components/UI/UnifiedSearch';
import TaskForm from '../components/UI/TaskForm';
import AppSidebar from '../components/UI/AppSidebar';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [columns, setColumns] = useState(mockColumns);
  const [retrospectives, setRetrospectives] = useState<RetrospectiveEntry[]>([]);
  // Separate filter states for Kanban and Timeline views
  const [kanbanFilters, setKanbanFilters] = useState<FilterState>({
    assignee: null,
    priority: null,
    tags: [],
    search: '',
    dateRange: {
      start: null,
      end: null,
    },
    source: null,
  });
  
  const [timelineFilters, setTimelineFilters] = useState<FilterState>({
    assignee: null,
    priority: null,
    tags: [],
    search: '',
    dateRange: {
      start: null,
      end: null,
    },
    source: null,
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [activeView, setActiveView] = useState<'board' | 'timeline' | 'retrospective' | 'team-energy'>('board');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<string>(typeof quarters[0] === 'string' ? quarters[0] : `Q${quarters[0].startMonth/3 + 1} ${new Date().getFullYear()}`);
  const { toast } = useToast();
  
  // Initialize theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  // Authentication handlers
  const handleLogin = (id: string) => {
    setUserId(id);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserId(null);
    setIsLoggedIn(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    // Clear filters based on active view
    const emptyFilters = {
      assignee: null,
      priority: null,
      tags: [],
      search: '',
      dateRange: {
        start: null,
        end: null,
      },
      source: null,
    };
    
    if (activeView === 'board') {
      setKanbanFilters(emptyFilters);
    } else if (activeView === 'timeline') {
      setTimelineFilters(emptyFilters);
    } else {
      // Clear both when in retrospective view
      setKanbanFilters(emptyFilters);
      setTimelineFilters(emptyFilters);
    }
  };

  // Task movement handler for drag and drop with activity logging
  const handleTaskMove = (taskId: string, newStatus: Status, comment?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const oldStatus = task.status;
    const now = new Date().toISOString();
    
    // Create activity log entry
    const logEntry: ActivityLogEntry = {
      id: uuidv4(),
      taskId,
      timestamp: now,
      type: 'status_change',
      previousValue: oldStatus,
      newValue: newStatus,
      comment,
      user: mockUsers.find(user => user.id === userId) || mockUsers[0],
    };
    
    // Calculate time spent in previous status
    const timeInPreviousStatus = task.timeInStatus[oldStatus] + 
      (new Date().getTime() - new Date(task.updatedAt).getTime());
    
    // Update the task's status, updatedAt, and activity log
    const updatedTasks = tasks.map(t =>
      t.id === taskId
        ? { 
            ...t, 
            status: newStatus, 
            updatedAt: now,
            activityLog: [...t.activityLog, logEntry],
            timeInStatus: {
              ...t.timeInStatus,
              [oldStatus]: timeInPreviousStatus
            }
          }
        : t
    );
    setTasks(updatedTasks);

    // Update columns
    const newColumns = columns.map(column => {
      if (column.id === newStatus) {
        // Add task to this column if not already there
        return {
          ...column,
          taskIds: column.taskIds.includes(taskId)
            ? column.taskIds
            : [...column.taskIds, taskId]
        };
      } else {
        // Remove task from this column if it's there
        return {
          ...column,
          taskIds: column.taskIds.filter(id => id !== taskId)
        };
      }
    });
    setColumns(newColumns);
  };

  // Get the active filters based on current view
  const getActiveFilters = () => {
    return activeView === 'board' ? kanbanFilters : timelineFilters;
  };

  // Filter tasks based on current filter settings and active view
  const filteredTasks = tasks.filter(task => {
    // Get the appropriate filters based on active view
    const activeFilters = getActiveFilters();
    
    // Filter by assignee
    if (activeFilters.assignee && (!task.assignee || task.assignee.id !== activeFilters.assignee)) {
      return false;
    }

    // Filter by priority
    if (activeFilters.priority && task.priority !== activeFilters.priority) {
      return false;
    }

    // Filter by tags (any match)
    if (activeFilters.tags.length > 0 && !activeFilters.tags.some(tag => task.tags.includes(tag))) {
      return false;
    }

    // Filter by search term
    if (
      activeFilters.search &&
      !task.title.toLowerCase().includes(activeFilters.search.toLowerCase()) &&
      !task.description.toLowerCase().includes(activeFilters.search.toLowerCase())
    ) {
      return false;
    }

    // Filter by date range
    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      const taskDate = new Date(task.deadline);
      
      if (activeFilters.dateRange.start && taskDate < activeFilters.dateRange.start) {
        return false;
      }
      
      if (activeFilters.dateRange.end) {
        const endDate = new Date(activeFilters.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (taskDate > endDate) {
          return false;
        }
      }
    }

    return true;
  });

  // Set filtered columns for the Kanban board
  const filteredColumns = columns.map(column => ({
    ...column,
    taskIds: column.taskIds.filter(taskId => 
      filteredTasks.some(task => task.id === taskId)
    ),
  }));

  // Handle task selection from unified search
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    // Find the task and determine if it's in Kanban or Timeline view
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // Scroll to the task in the appropriate view
      const element = document.getElementById(`task-${taskId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // Handle adding a comment to a task
  const handleAddComment = (taskId: string, comment: ThreadedComment, isQuickComment: boolean = false) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          // Add the comment to the task's comments array
          const updatedComments = [...(task.comments || []), comment];
          
          // For quick comments, we don't want to create an activity log entry
          // This ensures quick comments only appear under the Comments tab
          if (isQuickComment) {
            return {
              ...task,
              comments: updatedComments
            };
          } else {
            // For regular comments, create an activity log entry
            const activityEntry: ActivityLogEntry = {
              id: uuidv4(),
              taskId: taskId,
              timestamp: new Date().toISOString(),
              type: 'comment',
              comment: comment.content,
              user: comment.user
            };
            
            return {
              ...task,
              comments: updatedComments,
              activityLog: [...task.activityLog, activityEntry]
            };
          }
        }
        return task;
      });
    });
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the task.",
      duration: 2000,
    });
  };
  
  // Handle adding a reply to a comment
  const handleAddReply = (taskId: string, parentId: string, reply: ThreadedComment) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          // Find the parent comment and add the reply
          const updatedComments = task.comments?.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...comment.replies, reply]
              };
            }
            return comment;
          }) || [];
          
          return {
            ...task,
            comments: updatedComments
          };
        }
        return task;
      });
    });
    
    toast({
      title: "Reply Added",
      description: "Your reply has been added to the comment.",
      duration: 2000,
    });
  };
  
  // Micro Update functionality has been removed
  
  // Handle creating a new retrospective
  const handleCreateRetrospective = (retrospectiveData: Omit<RetrospectiveEntry, 'id' | 'createdAt'>) => {
    const newRetrospective: RetrospectiveEntry = {
      ...retrospectiveData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    setRetrospectives([...retrospectives, newRetrospective]);
    
    toast({
      title: "Retrospective Created",
      description: "Your retrospective has been successfully created.",
      duration: 3000,
    });
  };

  // Handle creating or updating a task
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === taskData.id ? { ...task, ...taskData, updatedAt: new Date().toISOString() } : task
      );
      setTasks(updatedTasks);
      toast({
        title: "Task Updated",
        description: "The task has been successfully updated.",
        duration: 3000,
      });
    } else {
      // Create new task
      const newTask: Task = {
        id: uuidv4(),
        title: taskData.title || "",
        description: taskData.description || "",
        status: taskData.status || "Backlog",
        projectStatus: taskData.projectStatus || "Planned",
        priority: taskData.priority || "Medium",
        assignee: taskData.assignee,
        productOwner: taskData.productOwner,
        tags: taskData.tags || [],
        deadline: taskData.deadline || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scope: taskData.scope || "",
        comments: [],
        reopenCount: 0,
        activityLog: [{
          id: uuidv4(),
          taskId: "", // Will be updated after task creation
          timestamp: new Date().toISOString(),
          type: "created",
          user: mockUsers.find(user => user.id === userId) || mockUsers[0],
          newValue: "Created task"
        }],
        timeInStatus: {
          'Backlog': 0,
          'In Progress': 0,
          'Review': 0,
          'Done': 0,
          'Blocked': 0
        }
      };
      
      // Update the taskId in the activity log
      newTask.activityLog[0].taskId = newTask.id;
      
      // Add the new task
      setTasks([...tasks, newTask]);
      
      // Update columns
      const updatedColumns = columns.map(column => {
        if (column.id === newTask.status) {
          return {
            ...column,
            taskIds: [...column.taskIds, newTask.id]
          };
        }
        return column;
      });
      setColumns(updatedColumns);
      
      toast({
        title: "Task Created",
        description: "The new task has been successfully created.",
        duration: 3000,
      });
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const loggedInUser = mockUsers.find(user => user.id === userId) || mockUsers[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header user={loggedInUser} onLogout={handleLogout} />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <AppSidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {activeView === 'board' ? 'Kanban Board' : 
               activeView === 'timeline' ? 'Timeline View' : 
               activeView === 'retrospective' ? 'Retrospective' : 
               'Team Energy Indicator'}
            </h1>
            {(activeView === 'board' || activeView === 'timeline') && (
              <div className="flex items-center space-x-4">
                <UnifiedSearch 
                  tasks={tasks} 
                  filters={activeView === 'board' ? kanbanFilters : timelineFilters} 
                  setFilters={activeView === 'board' ? setKanbanFilters : setTimelineFilters} 
                  onTaskSelect={handleTaskSelect} 
                />
                <Button 
                  onClick={() => setTaskFormOpen(true)}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  New Task
                </Button>
              </div>
            )}
          </div>
          
          {activeView !== 'retrospective' && (
            <FilterBar 
              filters={activeView === 'board' ? kanbanFilters : timelineFilters} 
              setFilters={activeView === 'board' ? setKanbanFilters : setTimelineFilters} 
              users={mockUsers}
              onClearFilters={clearFilters}
            />
          )}
          
          {/* Conditional rendering based on active view */}
          {activeView === 'board' ? (
            <KanbanBoard 
              columns={filteredColumns} 
              tasks={filteredTasks} 
              onTaskMove={handleTaskMove}
              onAddComment={handleAddComment}
              currentUser={loggedInUser}
            />
          ) : activeView === 'timeline' ? (
            <div className="space-y-6">
              <TimelineView 
                tasks={filteredTasks} 
                users={mockUsers}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                currentUser={loggedInUser}
              />
            </div>
          ) : activeView === 'retrospective' ? (
            <div className="space-y-6">
              <RetrospectiveView
                tasks={filteredTasks}
                users={mockUsers}
                currentPeriod={currentPeriod}
                retrospectives={retrospectives}
                onCreateRetrospective={handleCreateRetrospective}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <TeamEnergyPage tasks={tasks} />
            </div>
          )}
          
          <TaskForm
            open={taskFormOpen}
            onOpenChange={setTaskFormOpen}
            onSave={handleSaveTask}
            users={mockUsers}
          />
        </main>
      </div>


    </div>
  );
};

export default Index;
