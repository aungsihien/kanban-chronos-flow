
import { Task, User, Status, KanbanColumn, Tag, Priority, ProjectStatus, ActivityLogEntry, QuarterSummary } from "../types";

// Mock users
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Product Owner",
    initials: "AJ",
    color: "#3B82F6" // blue-500
  },
  {
    id: "u2",
    name: "Taylor Smith",
    email: "taylor@example.com",
    role: "Senior Product Owner",
    initials: "TS",
    color: "#8B5CF6" // violet-500
  },
  {
    id: "u3",
    name: "Morgan Lee",
    email: "morgan@example.com",
    role: "Product Owner",
    initials: "ML",
    color: "#10B981" // emerald-500
  }
];

// Logged in user for demonstration
export const currentUser = mockUsers[0];

// Mock tasks
// Generate mock activity log entries for a task
const generateActivityLog = (taskId: string, user: User, createdAt: string): ActivityLogEntry[] => {
  const createdDate = new Date(createdAt);
  
  return [
    {
      id: `log-${taskId}-1`,
      taskId,
      timestamp: createdDate.toISOString(),
      type: 'created',
      user,
      newValue: 'Created task'
    }
  ];
};

// Generate time in status record
const generateTimeInStatus = (): Record<Status, number> => {
  return {
    'Backlog': 0,
    'In Progress': 0,
    'Review': 0,
    'Done': 0,
    'Blocked': 0
  };
};

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Implement user authentication",
    description: "Set up secure login/logout functionality with JWT",
    status: "In Progress",
    projectStatus: "Ongoing",
    priority: "High",
    assignee: mockUsers[0],
    productOwner: mockUsers[0],
    tags: ["Feature"],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date().toISOString(),
    scope: "Authentication system for user login and session management",
    activityLog: generateActivityLog("t1", mockUsers[0], new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()),
    timeInStatus: generateTimeInStatus(),
  },
  {
    id: "t2",
    title: "Design product dashboard wireframes",
    description: "Create wireframes for the main product dashboard view",
    status: "Review",
    projectStatus: "Ongoing",
    priority: "Medium",
    assignee: mockUsers[1],
    productOwner: mockUsers[0],
    tags: ["Design"],
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString(),
    scope: "UI/UX design for the main dashboard interface",
    activityLog: generateActivityLog("t2", mockUsers[1], new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()),
    timeInStatus: generateTimeInStatus(),
  },
  {
    id: "t3",
    title: "API rate limiting bug",
    description: "Fix rate limiting issue causing 429 errors during high traffic",
    status: "Backlog",
    projectStatus: "Planned",
    priority: "High",
    assignee: mockUsers[2],
    productOwner: mockUsers[2],
    tags: ["Bug"],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString(),
    scope: "Fix API rate limiting to prevent 429 errors during high traffic periods",
    activityLog: generateActivityLog("t3", mockUsers[2], new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()),
    timeInStatus: generateTimeInStatus(),
  },
  {
    id: "t4",
    title: "Update user documentation",
    description: "Update user guide with new feature descriptions",
    status: "Done",
    projectStatus: "Done",
    priority: "Low",
    assignee: mockUsers[0],
    productOwner: mockUsers[1],
    tags: ["Documentation"],
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (completed)
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updatedAt: new Date().toISOString(),
    scope: "Update all user documentation with descriptions of recently added features",
    activityLog: generateActivityLog("t4", mockUsers[0], new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),
    timeInStatus: generateTimeInStatus(),
  },
  {
    id: "t5",
    title: "Explore payment gateway options",
    description: "Research payment gateway solutions for marketplace feature",
    status: "In Progress",
    projectStatus: "Ongoing",
    priority: "Medium",
    assignee: mockUsers[1],
    productOwner: mockUsers[0],
    tags: ["Research"],
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString(),
    scope: "Research and evaluate payment gateway options for the marketplace feature",
    activityLog: generateActivityLog("t5", mockUsers[1], new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    timeInStatus: generateTimeInStatus(),
  },
  {
    id: "t6",
    title: "Data migration script",
    description: "Create script for migrating legacy data to new database schema",
    status: "Blocked",
    projectStatus: "Ongoing",
    priority: "High",
    assignee: mockUsers[2],
    productOwner: mockUsers[2],
    tags: ["Feature"],
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    updatedAt: new Date().toISOString(),
    scope: "Create migration scripts to move data from legacy system to new database schema",
    activityLog: generateActivityLog("t6", mockUsers[2], new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()),
    timeInStatus: generateTimeInStatus(),
  },
  {
    id: "t7",
    title: "Mobile responsive design",
    description: "Ensure all components work well on mobile devices",
    status: "Backlog",
    projectStatus: "Planned",
    priority: "Medium",
    assignee: mockUsers[0],
    productOwner: mockUsers[1],
    tags: ["Design"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date().toISOString(),
    scope: "Make all UI components responsive for mobile devices",
    activityLog: generateActivityLog("t7", mockUsers[0], new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()),
    timeInStatus: generateTimeInStatus(),
  },
  {
    id: "t8",
    title: "Unit test coverage",
    description: "Improve unit test coverage for core functions",
    status: "Review",
    projectStatus: "Ongoing",
    priority: "Medium",
    assignee: mockUsers[1],
    productOwner: mockUsers[0],
    tags: ["Testing"],
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    updatedAt: new Date().toISOString(),
    scope: "Increase unit test coverage for core application functions",
    activityLog: generateActivityLog("t8", mockUsers[1], new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()),
    timeInStatus: generateTimeInStatus(),
  }
];

// Kanban columns
export const mockColumns: KanbanColumn[] = [
  {
    id: "Backlog",
    title: "Backlog",
    taskIds: mockTasks.filter(task => task.status === "Backlog").map(task => task.id),
    color: "#F1F5F9", // slate-100
  },
  {
    id: "In Progress",
    title: "In Progress",
    taskIds: mockTasks.filter(task => task.status === "In Progress").map(task => task.id),
    wipLimit: 3,
    color: "#DBEAFE", // blue-100
  },
  {
    id: "Review",
    title: "Review",
    taskIds: mockTasks.filter(task => task.status === "Review").map(task => task.id),
    wipLimit: 2,
    color: "#E0F2FE", // sky-100
  },
  {
    id: "Done",
    title: "Done",
    taskIds: mockTasks.filter(task => task.status === "Done").map(task => task.id),
    color: "#DCFCE7", // green-100
  },
  {
    id: "Blocked",
    title: "Blocked",
    taskIds: mockTasks.filter(task => task.status === "Blocked").map(task => task.id),
    color: "#FEE2E2", // red-100
  }
];

// Available tags
export const availableTags: Tag[] = [
  "Bug", 
  "Feature", 
  "Documentation", 
  "Research", 
  "Design", 
  "Testing"
];

// Available priorities
export const availablePriorities: Priority[] = ["High", "Medium", "Low"];

// Map priority to colors
export const priorityColorMap: Record<Priority, string> = {
  High: "bg-priority-high text-white",
  Medium: "bg-priority-medium text-white",
  Low: "bg-priority-low text-white"
};

// Map tags to colors
export const tagColorMap: Record<Tag, string> = {
  Bug: "bg-red-100 text-red-800",
  Feature: "bg-blue-100 text-blue-800",
  Documentation: "bg-purple-100 text-purple-800",
  Research: "bg-amber-100 text-amber-800",
  Design: "bg-indigo-100 text-indigo-800",
  Testing: "bg-emerald-100 text-emerald-800"
};

// Quarter definitions for the timeline
export const quarters = [
  { name: "Q1", startMonth: 0, endMonth: 2 },
  { name: "Q2", startMonth: 3, endMonth: 5 },
  { name: "Q3", startMonth: 6, endMonth: 8 },
  { name: "Q4", startMonth: 9, endMonth: 11 }
];

// Get current quarter
export const getCurrentQuarter = () => {
  const now = new Date();
  const month = now.getMonth();
  return quarters.find(q => month >= q.startMonth && month <= q.endMonth)?.name || "Q1";
};
