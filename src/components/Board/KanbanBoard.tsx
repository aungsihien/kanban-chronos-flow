
import React, { useState } from 'react';
import { KanbanColumn, Task, Status } from '../../types';
import { cn } from '../../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProfileBadge from '../UI/ProfileBadge';
import { tagColorMap, priorityColorMap } from '../../data/mockData';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Status) => void;
}

export const KanbanBoard = ({
  columns,
  tasks,
  onTaskMove,
}: KanbanBoardProps) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<Status | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: Status) => {
    e.preventDefault();
    setDragOverColumnId(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== columnId) {
      // Check WIP limits
      const targetColumn = columns.find(c => c.id === columnId);
      
      if (targetColumn?.wipLimit && 
          targetColumn.taskIds.length >= targetColumn.wipLimit) {
        toast({
          variant: "destructive",
          title: "WIP Limit Exceeded",
          description: `Column '${targetColumn.title}' has reached its WIP limit of ${targetColumn.wipLimit} tasks.`,
          duration: 3000,
        });
      } else {
        onTaskMove(taskId, columnId);
        toast({
          title: "Task Moved",
          description: `Task moved to ${columnId}`,
          duration: 2000,
        });
      }
    }
    
    setDragOverColumnId(null);
    setDraggingTaskId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-fade-in overflow-x-auto">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => column.taskIds.includes(task.id));
        const isOverWipLimit = column.wipLimit && columnTasks.length > column.wipLimit;
        const isNearWipLimit = column.wipLimit && columnTasks.length === column.wipLimit;
        
        return (
          <div
            key={column.id}
            className={cn(
              "kanban-column p-4 rounded-lg",
              dragOverColumnId === column.id && "drag-over border-primary border-2",
              "bg-white dark:bg-gray-800 border shadow-sm"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            style={{ backgroundColor: column.color + '30' }} // Transparent version of column color
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {columnTasks.length}
                  {column.wipLimit && (
                    `/${column.wipLimit}`
                  )}
                </span>
                {column.wipLimit && isNearWipLimit && (
                  <span className="wip-limit-warning">At Limit</span>
                )}
                {column.wipLimit && isOverWipLimit && (
                  <span className="wip-limit-exceeded">Over Limit</span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    "kanban-card border shadow-sm hover:shadow-md transition-all",
                    draggingTaskId === task.id && "dragging"
                  )}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                      <Badge
                        className={cn("ml-1 text-xs", priorityColorMap[task.priority])}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {task.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            tagColorMap[tag]
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="p-3 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {task.deadline && (
                        <div className="flex items-center">
                          <span className="mr-1">📅</span>
                          {format(new Date(task.deadline), "MMM d")}
                        </div>
                      )}
                    </div>
                    {task.assignee && (
                      <ProfileBadge
                        user={task.assignee}
                        size="sm"
                      />
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
