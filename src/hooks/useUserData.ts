import { useState, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

export const useUserData = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // In a real application, this would fetch from an API
  useEffect(() => {
    setLoading(true);
    try {
      // Using mock data directly, but simulating async behavior
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error loading users'));
      setLoading(false);
    }
  }, []);

  const getCurrentUser = (userId: string) => {
    return users.find(user => user.id === userId) || null;
  };

  return {
    users,
    loading,
    error,
    getCurrentUser
  };
};

export default useUserData;
