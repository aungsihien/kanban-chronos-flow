
// Task priority types
export type Priority = 'High' | 'Medium' | 'Low';

// Task status types
export type Status = 'Backlog' | 'In Progress' | 'Review' | 'Done' | 'Blocked';

// Project status types
export type ProjectStatus = 'Planned' | 'Ongoing' | 'Done';

// Task tag types
export type Tag = 'Bug' | 'Feature' | 'Documentation' | 'Research' | 'Design' | 'Testing';

// Role type for user roles
export type Role = 'Product Owner' | 'Product Manager' | 'Developer' | 'Tester' | 'Designer' | 'Stakeholder';

// Profile/User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | string;
  initials: string;
  color: string;
}

// Activity log entry type
export interface ActivityLogEntry {
  id: string;
  taskId: string;
  timestamp: string; // ISO date string
  type: 'status_change' | 'assignee_change' | 'priority_change' | 'created' | 'comment' | 'edited' | 'micro_update';
  previousValue?: string;
  newValue?: string;
  comment?: string;
  user: User;
}

// Comment thread type
export interface ThreadedComment {
  id: string;
  taskId: string;
  content: string;
  timestamp: string; // ISO date string
  user: User;
  replies: ThreadedComment[];
}

// Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  projectStatus: ProjectStatus;
  priority: Priority;
  assignee?: User;
  productOwner?: User;
  tags: Tag[];
  deadline: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  scope?: string; // Added for enhanced project details
  activityLog: ActivityLogEntry[];
  timeInStatus: Record<Status, number>; // Time spent in each status (milliseconds)
  comments: ThreadedComment[];
  reopenCount: number; // Number of times the project scope was reopened for editing
  stuckSince?: string; // Date when task became stuck in current status
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
  source?: 'kanban' | 'timeline' | null; // To track where search was initiated
}

// Timeline view types
export type TimeScale = 'day' | 'week' | 'month' | 'quarter';

export interface TimelineViewOptions {
  scale: TimeScale;
  showWeekends: boolean;
  groupBy: 'assignee' | 'status' | 'priority' | 'tag' | null;
}

// Theme type
export type Theme = 'light' | 'dark' | 'system';

// Quarter summary type for timeline overview
export interface QuarterSummary {
  name: string;
  totalTasks: number;
  byStatus: Record<ProjectStatus, number>;
  overdueTasks: number;
  nearDeadline: number; // Tasks due within 7 days
}

// Task movement confirmation type
export interface TaskMoveConfirmation {
  taskId: string;
  fromStatus: Status;
  toStatus: Status;
  comment: string;
}

// Retrospective entry type
export interface RetrospectiveEntry {
  id: string;
  period: string; // Quarter or sprint identifier
  lessonsLearned: string[];
  blockers: string[];
  wins: string[];
  relatedTaskIds: string[];
  createdAt: string;
  createdBy: User;
}

// Team Energy Indicator type
export interface TeamEnergyIndicator {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    taskLoad: number; // 0-100
    wipBreaches: number;
    stuckTasks: number;
    reopenedTasks: number;
  };
  timestamp: string;
}

// Public Timeline View settings
export interface PublicTimelineSettings {
  id: string;
  accessKey: string; // Unique key for accessing the public view
  title: string;
  description?: string;
  createdBy: User;
  createdAt: string;
  expiresAt?: string;
  allowedFilters: boolean;
  visibleColumns: Status[];
  hiddenTasks: string[]; // Array of task IDs to hide from public view
  isPasswordProtected: boolean;
  password?: string; // Optional password for protected views
  isPublic: boolean; // Whether the timeline is currently public or private
}

// Time Intelligence Alert type
export interface TimeIntelligenceAlert {
  id: string;
  taskId: string;
  type: 'stuck' | 'deadline_approaching' | 'frequent_reopens';
  severity: 'warning' | 'critical';
  message: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: User;
  acknowledgedAt?: string;
}
