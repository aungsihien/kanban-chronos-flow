import React from 'react';
import { useTaskData } from '../hooks/useTaskData';
import { useUserData } from '../hooks/useUserData';
import VerticalTimeline from '../components/Timeline/VerticalTimeline';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const VerticalTimelinePage = () => {
  const { tasks } = useTaskData();
  const { users } = useUserData();
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" asChild className="mr-2">
          <Link to="/timeline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Timeline
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Vertical Project Timeline</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <VerticalTimeline tasks={tasks} users={users} />
      </div>
    </div>
  );
};

export default VerticalTimelinePage;
