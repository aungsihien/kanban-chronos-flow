
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
import { AlertCircle } from 'lucide-react';
import ProfileBadge from '../UI/ProfileBadge';
import { tagColorMap, priorityColorMap } from '../../data/mockData';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import TaskDetail from '../UI/TaskDetail';
import TaskMoveConfirmation from '../UI/TaskMoveConfirmation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Status, comment?: string) => void;
}

export const KanbanBoard = ({
  columns,
  tasks,
  onTaskMove,
}: KanbanBoardProps) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<Status | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [moveConfirmOpen, setMoveConfirmOpen] = useState(false);
  const [moveToStatus, setMoveToStatus] = useState<Status | null>(null);
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
      // Instead of preventing the move, we'll show a confirmation dialog
      setSelectedTask(task);
      setMoveToStatus(columnId);
      setMoveConfirmOpen(true);
    }
    
    setDragOverColumnId(null);
    setDraggingTaskId(null);
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };
  
  const handleMoveConfirm = (taskId: string, newStatus: Status, comment: string) => {
    onTaskMove(taskId, newStatus, comment);
    toast({
      title: "Task Moved",
      description: `Task moved to ${newStatus}`,
      duration: 2000,
    });
  };

  return (
    <>
      <div className="flex gap-4 animate-fade-in overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => column.taskIds.includes(task.id));
        const isOverWipLimit = column.wipLimit && columnTasks.length > column.wipLimit;
        const isNearWipLimit = column.wipLimit && columnTasks.length === column.wipLimit;
        
        return (
          <div
            key={column.id}
            className={cn(
              "kanban-column p-4 rounded-lg flex-shrink-0",
              dragOverColumnId === column.id && "drag-over border-primary border-2",
              "bg-white dark:bg-gray-800 border shadow-sm"
            )}
            style={{ 
              width: '280px', 
              backgroundColor: column.color + '30',
              transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out'
            }}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            // Style moved to the div above
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 ml-1">
                          At Limit
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This column has reached its WIP limit of {column.wipLimit} tasks.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {column.wipLimit && isOverWipLimit && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 ml-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Over Limit
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This column exceeds its WIP limit of {column.wipLimit} tasks. Consider moving tasks to other columns.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    "kanban-card border shadow-sm hover:shadow-md transition-all cursor-pointer w-full",
                    draggingTaskId === task.id && "dragging"
                  )}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => handleTaskClick(task)}
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
      
      {/* Task Detail Dialog */}
      <TaskDetail 
        task={selectedTask} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
      
      {/* Task Move Confirmation Dialog */}
      <TaskMoveConfirmation
        task={selectedTask}
        fromStatus={selectedTask?.status || null}
        toStatus={moveToStatus}
        open={moveConfirmOpen}
        onOpenChange={setMoveConfirmOpen}
        onConfirm={handleMoveConfirm}
      />
    </>
  );
};

export default KanbanBoard;
