
import React, { useState, useRef } from 'react';
import { KanbanColumn, Task, Status, ThreadedComment, User } from '../../types';
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
import { AlertCircle, MessageCircle, Send, Plus } from 'lucide-react';
import ProfileBadge from '../UI/ProfileBadge';
import { tagColorMap, priorityColorMap } from '../../data/mockData';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import TaskDetail from '../UI/TaskDetail';
import TaskMoveConfirmation from '../UI/TaskMoveConfirmation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: Status, comment?: string) => void;
  onAddComment?: (taskId: string, comment: ThreadedComment, isQuickComment?: boolean) => void;
  currentUser?: User;
}

export const KanbanBoard = ({
  columns,
  tasks,
  onTaskMove,
  onAddComment,
  currentUser,
}: KanbanBoardProps) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<Status | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [moveConfirmOpen, setMoveConfirmOpen] = useState(false);
  const [moveToStatus, setMoveToStatus] = useState<Status | null>(null);
  const [quickCommentTask, setQuickCommentTask] = useState<string | null>(null);
  const [quickCommentText, setQuickCommentText] = useState('');
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
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
  
  const handleQuickCommentOpen = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault(); // Prevent any default behavior
    setQuickCommentTask(taskId);
    setQuickCommentText('');
    // Focus the textarea after popover opens
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 100);
  };
  
  const handleAddQuickComment = () => {
    if (!quickCommentTask || !currentUser || !onAddComment || quickCommentText.trim() === '') return;
    
    const comment: ThreadedComment = {
      id: uuidv4(),
      taskId: quickCommentTask,
      content: quickCommentText,
      timestamp: new Date().toISOString(),
      user: currentUser,
      replies: [],
    };
    
    onAddComment(quickCommentTask, comment, true); // Pass true to indicate this is a quick comment
    setQuickCommentTask(null);
    setQuickCommentText('');
    setOpenPopoverId(null); // Close the popover
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the task",
      duration: 2000,
    });
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
                    <div className="flex items-center gap-2">
                      {task.deadline && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-1">📅</span>
                          {format(new Date(task.deadline), "MMM d")}
                        </div>
                      )}
                      
                      {/* Comment indicator with count */}
                      {task.comments && task.comments.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center text-xs text-gray-500">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                <span>{task.comments.length}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {/* Quick comment button */}
                      {currentUser && onAddComment && (
                        <Popover 
                          open={openPopoverId === task.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenPopoverId(task.id);
                              setQuickCommentTask(task.id);
                              setQuickCommentText('');
                              // Focus the textarea after popover opens
                              setTimeout(() => {
                                if (commentInputRef.current) {
                                  commentInputRef.current.focus();
                                }
                              }, 100);
                            } else {
                              setOpenPopoverId(null);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Plus className="h-3 w-3 text-gray-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-72" 
                            align="start" 
                            side="bottom"
                            onInteractOutside={(e) => {
                              // Only close if clicking outside the popover
                              // Don't close when interacting with the content
                              e.preventDefault();
                            }}
                            onClick={(e) => {
                              // Prevent click from propagating to card
                              e.stopPropagation();
                            }}
                          >
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Add Quick Comment</h4>
                              <Textarea 
                                ref={commentInputRef}
                                placeholder="Type your comment here..."
                                className="min-h-[80px] text-sm"
                                value={quickCommentText}
                                onChange={(e) => setQuickCommentText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                              />
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickCommentTask(null);
                                    setOpenPopoverId(null); // Close the popover
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddQuickComment();
                                  }}
                                  disabled={quickCommentText.trim() === ''}
                                  className="flex items-center gap-1"
                                >
                                  <Send className="h-3 w-3" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
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
        onAddComment={onAddComment}
        onAddReply={(taskId, parentId, reply) => {
          // Handle reply logic here if implemented in parent component
        }}
        currentUser={currentUser}
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
