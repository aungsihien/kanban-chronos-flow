import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Task, FilterState } from "@/types";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UnifiedSearchProps {
  tasks: Task[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onTaskSelect: (taskId: string) => void;
}

const UnifiedSearch = ({ tasks, filters, setFilters, onTaskSelect }: UnifiedSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSelect = (taskId: string) => {
    onTaskSelect(taskId);
    setOpen(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.status.toLowerCase().includes(query) ||
      task.projectStatus.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query) ||
      task.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      (task.assignee && task.assignee.name.toLowerCase().includes(query)) ||
      (task.productOwner && task.productOwner.name.toLowerCase().includes(query))
    );
  });

  const getTaskSource = (task: Task) => {
    const kanbanSources = ["Backlog", "In Progress", "Review", "Blocked", "Done"];
    const timelineSources = ["Planned", "Ongoing", "Done"];
    
    const kanbanMatch = kanbanSources.includes(task.status);
    const timelineMatch = timelineSources.includes(task.projectStatus);
    
    if (kanbanMatch && timelineMatch) {
      return ["[Kanban]", "[Timeline]"];
    } else if (kanbanMatch) {
      return ["[Kanban]"];
    } else if (timelineMatch) {
      return ["[Timeline]"];
    }
    
    return [];
  };

  return (
    <>
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search tasks... (Ctrl+K)"
          className="pl-8"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search tasks, assignees, tags..."
          value={searchQuery}
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tasks">
            {filteredTasks.map((task) => (
              <CommandItem
                key={task.id}
                onSelect={() => handleSelect(task.id)}
                className="flex justify-between"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {getTaskSource(task).map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                    <span>{task.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {task.status} • {task.priority} • Due: {format(new Date(task.deadline), "MMM d")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default UnifiedSearch;
