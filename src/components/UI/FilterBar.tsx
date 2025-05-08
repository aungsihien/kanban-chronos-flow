
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { FilterState, User, Priority, Tag } from '../../types';
import { availableTags, availablePriorities, tagColorMap } from '../../data/mockData';
import { CalendarIcon } from 'lucide-react';
import { format } from "date-fns";

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  users: User[];
  onClearFilters: () => void;
}

export const FilterBar = ({
  filters,
  setFilters,
  users,
  onClearFilters,
}: FilterBarProps) => {
  const handleTagToggle = (tag: Tag) => {
    setFilters(prev => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tag]
        };
      }
    });
  };

  const isFiltersActive = Boolean(
    filters.assignee ||
    filters.priority ||
    filters.tags.length > 0 ||
    filters.search ||
    filters.dateRange.start ||
    filters.dateRange.end
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border mb-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search input */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full"
          />
        </div>

        {/* Assignee filter */}
        <div>
          <Select
            value={filters.assignee || ''}
            onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value || null }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority filter */}
        <div>
          <Select
            value={filters.priority || ''}
            onValueChange={(value) => 
              setFilters(prev => ({ 
                ...prev, 
                priority: value as Priority | null 
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {availablePriorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date filter */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.start ? (
                  filters.dateRange.end ? (
                    <>
                      {format(filters.dateRange.start, "MMM d")} -{" "}
                      {format(filters.dateRange.end, "MMM d")}
                    </>
                  ) : (
                    format(filters.dateRange.start, "MMM d")
                  )
                ) : (
                  "Deadline"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.start || undefined,
                  to: filters.dateRange.end || undefined,
                }}
                onSelect={(range) => {
                  setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: range?.from || null,
                      end: range?.to || null,
                    }
                  }));
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear filters button */}
        <div className="lg:text-right">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            disabled={!isFiltersActive}
            className="h-10 w-full lg:w-auto"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <Badge 
            key={tag}
            variant={filters.tags.includes(tag) ? "default" : "outline"}
            onClick={() => handleTagToggle(tag)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
