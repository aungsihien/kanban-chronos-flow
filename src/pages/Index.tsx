
import React, { useState, useEffect } from 'react';
import { mockUsers, mockTasks, mockColumns, currentUser } from '../data/mockData';
import { FilterState, Status, Task, User } from '../types';
import Header from '../components/UI/Header';
import FilterBar from '../components/UI/FilterBar';
import KanbanBoard from '../components/Board/KanbanBoard';
import TimelineView from '../components/Timeline/TimelineView';
import LoginForm from '../components/Auth/LoginForm';
import { useToast } from '@/components/ui/use-toast';

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
  });
  const { toast } = useToast();

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

  // Task movement handler for drag and drop
  const handleTaskMove = (taskId: string, newStatus: Status) => {
    // Update the task's status
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
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

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const loggedInUser = mockUsers.find(user => user.id === userId) || mockUsers[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={loggedInUser} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">Product Management Dashboard</h1>
        
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          users={mockUsers}
          onClearFilters={clearFilters}
        />
        
        <KanbanBoard 
          columns={filteredColumns} 
          tasks={filteredTasks} 
          onTaskMove={handleTaskMove}
        />
        
        <TimelineView tasks={filteredTasks} users={mockUsers} />
      </main>

      <footer className="bg-white shadow-md dark:bg-gray-800 border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Chronos Flow - Hybrid Kanban Timeline System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
