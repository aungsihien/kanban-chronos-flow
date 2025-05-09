import { useState, useEffect } from 'react';
import { Task } from '../types';
import { mockTasks } from '../data/mockData';

export const useTaskData = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // In a real application, this would fetch from an API
  useEffect(() => {
    setLoading(true);
    try {
      // Using mock data directly, but simulating async behavior
      setTimeout(() => {
        setTasks(mockTasks);
        setLoading(false);
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error loading tasks'));
      setLoading(false);
    }
  }, []);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask
  };
};

export default useTaskData;
