import React, { useState } from "react";
import { Task, ActivityLogEntry, ThreadedComment, User } from "@/types";
import { format, differenceInDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProfileBadge from "./ProfileBadge";
import { tagColorMap, priorityColorMap } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, RefreshCw } from "lucide-react";
import ThreadedComments from "./ThreadedComments";

interface TaskDetailProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComment?: (taskId: string, comment: ThreadedComment) => void;
  onAddReply?: (taskId: string, parentId: string, reply: ThreadedComment) => void;
  currentUser?: User;
}

const TaskDetail = ({ task, open, onOpenChange, onAddComment, onAddReply, currentUser }: TaskDetailProps) => {
  if (!task) return null;

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Ongoing":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "Done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getActivityIcon = (type: ActivityLogEntry["type"]) => {
    switch (type) {
      case "created":
        return "🆕";
      case "status_change":
        return "🔄";
      case "assignee_change":
        return "👤";
      case "priority_change":
        return "🔼";
      case "comment":
        return "💬";
      case "edited":
        return "✏️";
      default:
        return "📝";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Created {formatDistanceToNow(new Date(task.createdAt))} ago
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={priorityColorMap[task.priority]}>
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.projectStatus)}>
                {task.projectStatus}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden">
          <TabsList className="mb-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="time">Time Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4 p-1">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                  <p className="mt-1">{task.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Scope</h3>
                  <p className="mt-1">{task.scope || "No scope defined"}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <p className="mt-1">{task.status}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Status</h3>
                    <p className="mt-1">{task.projectStatus}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</h3>
                    <p className="mt-1">{format(new Date(task.deadline), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded ${tagColorMap[tag]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignee</h3>
                    <div className="mt-1">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <ProfileBadge user={task.assignee} size="md" />
                          <div>
                            <p className="font-medium">{task.assignee.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{task.assignee.role}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Unassigned</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Owner</h3>
                    <div className="mt-1">
                      {task.productOwner ? (
                        <div className="flex items-center gap-2">
                          <ProfileBadge user={task.productOwner} size="md" />
                          <div>
                            <p className="font-medium">{task.productOwner.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{task.productOwner.role}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No product owner</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4 p-1">
                <h3 className="text-sm font-medium">Activity History</h3>
                
                {task.activityLog.length > 0 ? (
                  <div className="space-y-3">
                    {task.activityLog.map((entry) => (
                      <div key={entry.id} className="flex gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="text-xl">{getActivityIcon(entry.type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <ProfileBadge user={entry.user} size="sm" />
                            <span className="font-medium">{entry.user.name}</span>
                          </div>
                          <p className="mt-1">
                            {entry.type === "status_change" && (
                              <>Changed status from <strong>{entry.previousValue}</strong> to <strong>{entry.newValue}</strong></>
                            )}
                            {entry.type === "assignee_change" && (
                              <>Changed assignee from <strong>{entry.previousValue}</strong> to <strong>{entry.newValue}</strong></>
                            )}
                            {entry.type === "priority_change" && (
                              <>Changed priority from <strong>{entry.previousValue}</strong> to <strong>{entry.newValue}</strong></>
                            )}
                            {entry.type === "created" && (
                              <>Created this task</>
                            )}
                            {entry.type === "comment" && (
                              <>{entry.comment}</>
                            )}
                            {entry.type === "edited" && (
                              <>Edited task details</>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTimestamp(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No activity recorded yet</p>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-2">Time in Status</h3>
                  <div className="space-y-2">
                    {Object.entries(task.timeInStatus).map(([status, time]) => (
                      <div key={status} className="flex justify-between">
                        <span>{status}</span>
                        <span>{Math.round(time / (1000 * 60 * 60))} hours</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="comments" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="p-1">
                {currentUser && onAddComment && onAddReply ? (
                  <ThreadedComments
                    comments={task.comments || []}
                    taskId={task.id}
                    currentUser={currentUser}
                    onAddComment={(comment) => onAddComment(task.id, comment)}
                    onAddReply={(parentId, reply) => onAddReply(task.id, parentId, reply)}
                  />
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    <p>Comments are not available in this view.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="time" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4 p-1">
                <div>
                  <h3 className="text-sm font-medium mb-2">Time Intelligence</h3>
                  
                  {/* Time in current status */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Time in Current Status</span>
                    </div>
                    <div className="pl-6">
                      <p>
                        This task has been in <strong>{task.status}</strong> for{" "}
                        {task.stuckSince ? (
                          <span className={differenceInDays(new Date(), new Date(task.stuckSince)) > 30 ? "text-red-500 font-bold" : ""}>
                            {differenceInDays(new Date(), new Date(task.stuckSince))} days
                          </span>
                        ) : (
                          <span>
                            {differenceInDays(new Date(), new Date(task.updatedAt))} days
                          </span>
                        )}
                      </p>
                      {task.stuckSince && differenceInDays(new Date(), new Date(task.stuckSince)) > 30 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Task Stuck Warning</p>
                            <p className="text-xs text-red-700">This task has been in the same status for over a month. Consider taking action.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Deadline information */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">Deadline Status</span>
                    </div>
                    <div className="pl-6">
                      <p>
                        Deadline: <strong>{format(new Date(task.deadline), "MMM d, yyyy")}</strong>
                      </p>
                      <p className="mt-1">
                        {differenceInDays(new Date(task.deadline), new Date()) < 0 ? (
                          <span className="text-red-500 font-medium">
                            Overdue by {Math.abs(differenceInDays(new Date(task.deadline), new Date()))} days
                          </span>
                        ) : differenceInDays(new Date(task.deadline), new Date()) < 7 ? (
                          <span className="text-amber-500 font-medium">
                            Due soon ({differenceInDays(new Date(task.deadline), new Date())} days remaining)
                          </span>
                        ) : (
                          <span className="text-green-500">
                            On track ({differenceInDays(new Date(task.deadline), new Date())} days remaining)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Reopen count */}
                  {task.reopenCount > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <RefreshCw className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Scope Changes</span>
                      </div>
                      <div className="pl-6">
                        <p>
                          This project has been reopened for scope changes <strong>{task.reopenCount} times</strong>.
                        </p>
                        {task.reopenCount >= 3 && (
                          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-md flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-purple-800">Frequent Changes</p>
                              <p className="text-xs text-purple-700">This project has been reopened multiple times. Consider reviewing the scope definition process.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Time in Each Status</h3>
                  <div className="space-y-2">
                    {Object.entries(task.timeInStatus).map(([status, time]) => (
                      <div key={status} className="flex justify-between">
                        <span>{status}</span>
                        <span>{Math.round(time / (1000 * 60 * 60))} hours</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetail;
