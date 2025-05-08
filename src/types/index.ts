
// Task priority types
export type Priority = 'High' | 'Medium' | 'Low';

// Task status types
export type Status = 'Backlog' | 'In Progress' | 'Review' | 'Done' | 'Blocked';

// Task tag types
export type Tag = 'Bug' | 'Feature' | 'Documentation' | 'Research' | 'Design' | 'Testing';

// Profile/User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
}

// Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee?: User;
  tags: Tag[];
  deadline: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Kanban column type
export interface KanbanColumn {
  id: Status;
  title: string;
  taskIds: string[];
  wipLimit?: number;
  color: string;
}

// Board type to contain columns
export interface Board {
  columns: KanbanColumn[];
}

// Filter state type
export interface FilterState {
  assignee: string | null;
  priority: Priority | null;
  tags: Tag[];
  search: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// Timeline view types
export type TimeScale = 'day' | 'week' | 'month' | 'quarter';

export interface TimelineViewOptions {
  scale: TimeScale;
  showWeekends: boolean;
  groupBy: 'assignee' | 'status' | 'priority' | 'tag' | null;
}
