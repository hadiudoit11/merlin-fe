/**
 * Task types matching the Merlin backend Task model.
 * Enhanced with Trello-like features: labels, checklists, covers.
 */

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskSource = 'manual' | 'zoom' | 'slack' | 'calendar' | 'email' | 'jira' | 'ai_extracted';

// Trello-like label colors
export type LabelColor =
  | 'green' | 'yellow' | 'orange' | 'red' | 'purple'
  | 'blue' | 'sky' | 'lime' | 'pink' | 'black' | 'none';

export interface TaskLabel {
  id: string;
  color: LabelColor;
  name?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskChecklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

// Card cover can be a color or an image URL
export interface TaskCover {
  type: 'color' | 'image';
  value: string; // color hex or image URL
  size: 'half' | 'full'; // half shows card content, full hides it
}

export interface LinkedNode {
  id: number;
  name: string;
  node_type: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  assignee_avatar?: string | null; // Avatar URL
  due_date: string | null;
  due_date_text: string | null;
  start_date?: string | null; // Trello has start dates too
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  source_id: string | null;
  source_url: string | null;
  context: string | null;
  canvas_id: number | null;
  tags: string[];
  is_overdue: boolean;
  linked_nodes: LinkedNode[];
  created_at: string;
  updated_at: string;
  // Trello-like features (stored in frontend, can extend to backend later)
  labels?: TaskLabel[];
  checklists?: TaskChecklist[];
  cover?: TaskCover | null;
  attachment_count?: number;
  comment_count?: number;
}

export interface TaskCreate {
  title: string;
  description?: string;
  assignee_name?: string;
  assignee_email?: string;
  assignee_avatar?: string;
  start_date?: string;
  due_date?: string;
  due_date_text?: string;
  priority?: TaskPriority;
  canvas_id?: number;
  tags?: string[];
  // Trello-like features
  labels?: TaskLabel[];
  checklists?: TaskChecklist[];
  cover?: TaskCover;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  assignee_name?: string;
  assignee_email?: string;
  assignee_avatar?: string;
  start_date?: string;
  due_date?: string;
  due_date_text?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  canvas_id?: number;
  tags?: string[];
  // Trello-like features
  labels?: TaskLabel[];
  checklists?: TaskChecklist[];
  cover?: TaskCover | null;
  attachment_count?: number;
  comment_count?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  source?: TaskSource;
  canvas_id?: number;
  assignee_email?: string;
  overdue?: boolean;
  page?: number;
  page_size?: number;
}

// For Kanban board columns
export interface TasksByStatus {
  pending: Task[];
  in_progress: Task[];
  completed: Task[];
  cancelled: Task[];
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Done',
  cancelled: 'Cancelled',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const TASK_SOURCE_LABELS: Record<TaskSource, string> = {
  manual: 'Manual',
  zoom: 'Zoom',
  slack: 'Slack',
  calendar: 'Calendar',
  email: 'Email',
  jira: 'Jira',
  ai_extracted: 'AI Extracted',
};

// Trello-like label colors with their display values
export const LABEL_COLORS: Record<LabelColor, { bg: string; text: string; name: string }> = {
  green: { bg: '#61bd4f', text: '#ffffff', name: 'Green' },
  yellow: { bg: '#f2d600', text: '#1d2125', name: 'Yellow' },
  orange: { bg: '#ff9f1a', text: '#1d2125', name: 'Orange' },
  red: { bg: '#eb5a46', text: '#ffffff', name: 'Red' },
  purple: { bg: '#c377e0', text: '#ffffff', name: 'Purple' },
  blue: { bg: '#0079bf', text: '#ffffff', name: 'Blue' },
  sky: { bg: '#00c2e0', text: '#1d2125', name: 'Sky' },
  lime: { bg: '#51e898', text: '#1d2125', name: 'Lime' },
  pink: { bg: '#ff78cb', text: '#1d2125', name: 'Pink' },
  black: { bg: '#344563', text: '#ffffff', name: 'Black' },
  none: { bg: 'transparent', text: '#6b778c', name: 'No color' },
};

// Cover colors (matching Trello's cover color palette)
export const COVER_COLORS = [
  '#61bd4f', // green
  '#f2d600', // yellow
  '#ff9f1a', // orange
  '#eb5a46', // red
  '#c377e0', // purple
  '#0079bf', // blue
  '#00c2e0', // sky
  '#51e898', // lime
  '#ff78cb', // pink
  '#344563', // black
];

// Due date status colors
export const DUE_DATE_STYLES = {
  overdue: { bg: '#eb5a46', text: '#ffffff' },
  dueSoon: { bg: '#f2d600', text: '#1d2125' }, // within 24 hours
  complete: { bg: '#61bd4f', text: '#ffffff' },
  normal: { bg: '#091e420a', text: '#44546f' },
};

// Helper to calculate checklist progress
export function getChecklistProgress(checklists: TaskChecklist[]): { completed: number; total: number } {
  let completed = 0;
  let total = 0;
  checklists.forEach(checklist => {
    checklist.items.forEach(item => {
      total++;
      if (item.completed) completed++;
    });
  });
  return { completed, total };
}

// Helper to check if due date is within 24 hours
export function isDueSoon(dueDate: string): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilDue > 0 && hoursUntilDue <= 24;
}

// Helper to group tasks by status for Kanban view
export function groupTasksByStatus(tasks: Task[]): TasksByStatus {
  return {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
    cancelled: tasks.filter(t => t.status === 'cancelled'),
  };
}
