
import React, { useState, useEffect } from 'react';
import { mockUsers, mockTasks, mockColumns, currentUser, quarters } from '../data/mockData';
import { FilterState, Status, Task, User, ActivityLogEntry, Theme } from '../types';
import Header from '../components/UI/Header';
import FilterBar from '../components/UI/FilterBar';
import KanbanBoard from '../components/Board/KanbanBoard';
import TimelineView from '../components/Timeline/TimelineView';

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
  const [filters, setFilters] = useState<FilterState>({
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
  const [activeView, setActiveView] = useState<'board' | 'timeline'>('board');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    setFilters({
      assignee: null,
      priority: null,
      tags: [],
      search: '',
      dateRange: {
        start: null,
        end: null,
      },
    });
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

  // Filter tasks based on current filter settings
  const filteredTasks = tasks.filter(task => {
    // Filter by assignee
    if (filters.assignee && (!task.assignee || task.assignee.id !== filters.assignee)) {
      return false;
    }

    // Filter by priority
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    // Filter by tags (any match)
    if (filters.tags.length > 0 && !filters.tags.some(tag => task.tags.includes(tag))) {
      return false;
    }

    // Filter by search term
    if (
      filters.search &&
      !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !task.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      const taskDate = new Date(task.deadline);
      
      if (filters.dateRange.start && taskDate < filters.dateRange.start) {
        return false;
      }
      
      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
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
              {activeView === 'board' ? 'Kanban Board' : 'Timeline View'}
            </h1>
            <div className="flex items-center space-x-4">
              <UnifiedSearch 
                tasks={tasks} 
                filters={filters} 
                setFilters={setFilters} 
                onTaskSelect={handleTaskSelect} 
              />
              <Button 
                onClick={() => setTaskFormOpen(true)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                New Task
              </Button>
            </div>
          </div>
          
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            users={mockUsers}
            onClearFilters={clearFilters}
          />
          
          {/* Conditional rendering based on active view */}
          {activeView === 'board' ? (
            <KanbanBoard 
              columns={filteredColumns} 
              tasks={filteredTasks} 
              onTaskMove={handleTaskMove}
            />
          ) : (
            <div className="space-y-6">

              <TimelineView 
                tasks={filteredTasks} 
                users={mockUsers} 
              />
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
