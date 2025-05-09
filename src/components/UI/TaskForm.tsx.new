import React, { useState } from "react";
import { Task, User, Status, Priority, Tag, ProjectStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, AlertCircle, Clock, InfoIcon } from "lucide-react";
import { format, addMonths, addDays, isBefore } from "date-fns";
import { availableTags, availablePriorities } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task;
  users: User[];
  isEditing?: boolean;
}

const TaskForm = ({
  open,
  onOpenChange,
  onSave,
  task,
  users,
  isEditing = false,
}: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [scope, setScope] = useState(task?.scope || "");
  const [status, setStatus] = useState<Status>(task?.status || "Backlog");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(
    task?.projectStatus || "Planned"
  );
  const [priority, setPriority] = useState<Priority>(task?.priority || "Medium");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(
    task?.assignee?.id
  );
  const [productOwnerId, setProductOwnerId] = useState<string | undefined>(
    task?.productOwner?.id
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(task?.tags || []);
  const [date, setDate] = useState<Date | undefined>(
    task?.deadline ? new Date(task.deadline) : addMonths(new Date(), 1)
  );
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeadlineWarning, setShowDeadlineWarning] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = "Project name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!scope.trim()) newErrors.scope = "Scope is required";
    if (!productOwnerId) newErrors.productOwner = "Product Owner is required";
    if (!assigneeId) newErrors.assignee = "Assignee is required";
    if (!date) newErrors.deadline = "Deadline is required for timeline planning";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Check if deadline is too soon (less than 7 days)
    if (date && isBefore(date, addDays(new Date(), 7))) {
      setShowDeadlineWarning(true);
      return;
    }
    
    const assignee = assigneeId ? users.find((user) => user.id === assigneeId) : undefined;
    const productOwner = productOwnerId ? users.find((user) => user.id === productOwnerId) : undefined;
    
    const updatedTask: Partial<Task> = {
      id: task?.id,
      title,
      description,
      scope,
      status,
      projectStatus,
      priority,
      assignee,
      productOwner,
      tags: selectedTags,
      deadline: date!.toISOString(),
      reopenCount: task?.reopenCount || 0,
    };
    
    onSave(updatedTask);
    onOpenChange(false);
  };
  
  const confirmDeadline = () => {
    setShowDeadlineWarning(false);
    
    const assignee = assigneeId ? users.find((user) => user.id === assigneeId) : undefined;
    const productOwner = productOwnerId ? users.find((user) => user.id === productOwnerId) : undefined;
    
    const updatedTask: Partial<Task> = {
      id: task?.id,
      title,
      description,
      scope,
      status,
      projectStatus,
      priority,
      assignee,
      productOwner,
      tags: selectedTags,
      deadline: date!.toISOString(),
      reopenCount: task?.reopenCount || 0,
    };
    
    onSave(updatedTask);
    onOpenChange(false);
  };
  
  const toggleTag = (tag: Tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the project details below."
                : "Fill in the details to create a new project."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="required flex items-center gap-1">
                    Project Name
                    {errors.title && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter project name"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope" className="required flex items-center gap-1">
                    Scope
                    {errors.scope && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px]">Define what's included and excluded in this project</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Textarea
                    id="scope"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    placeholder="Define what's included and excluded in this project"
                    className={cn("min-h-[100px]", errors.scope ? "border-red-500" : "")}
                  />
                  {errors.scope && (
                    <p className="text-xs text-red-500 mt-1">{errors.scope}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="required flex items-center gap-1">
                    Description
                    {errors.description && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed project description"
                    className={cn("min-h-[100px]", errors.description ? "border-red-500" : "")}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value) => setStatus(value as Status)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Backlog">Backlog</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectStatus">Project Status</Label>
                    <Select
                      value={projectStatus}
                      onValueChange={(value) => setProjectStatus(value as ProjectStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={(value) => setPriority(value as Priority)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePriorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="required flex items-center gap-1">
                      Deadline
                      {errors.deadline && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Clock className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px]">Required for timeline view. Projects will appear on the timeline based on this date.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                            errors.deadline && "border-red-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select deadline"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => isBefore(date, new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.deadline && (
                      <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>
                    )}
                    {date && !errors.deadline && (
                      <p className="text-xs text-gray-500 mt-1">
                        Project will appear on the timeline view
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignee" className="required flex items-center gap-1">
                    Assignee
                    {errors.assignee && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </Label>
                  <Select
                    value={assigneeId}
                    onValueChange={setAssigneeId}
                  >
                    <SelectTrigger className={errors.assignee ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assignee && (
                    <p className="text-xs text-red-500 mt-1">{errors.assignee}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productOwner" className="required flex items-center gap-1">
                    Product Owner
                    {errors.productOwner && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </Label>
                  <Select
                    value={productOwnerId}
                    onValueChange={setProductOwnerId}
                  >
                    <SelectTrigger className={errors.productOwner ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select product owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.productOwner && (
                    <p className="text-xs text-red-500 mt-1">{errors.productOwner}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {!isEditing && (
              <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  When projects are created, you must input the deadline to set up the timeline view.
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deadline warning dialog */}
      {showDeadlineWarning && (
        <Dialog open={showDeadlineWarning} onOpenChange={setShowDeadlineWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deadline Warning</DialogTitle>
              <DialogDescription>
                The deadline you've set is less than 7 days from today. This might not provide enough time for project completion.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Short deadlines may lead to rushed work and quality issues.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeadlineWarning(false)}>
                Change Deadline
              </Button>
              <Button variant="destructive" onClick={confirmDeadline}>
                Use Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TaskForm;
