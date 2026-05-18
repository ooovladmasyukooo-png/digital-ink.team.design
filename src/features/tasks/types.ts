export type TasksViewTabId = 'by-date' | 'by-area' | 'personal' | 'delegated' | 'archive';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface TaskAssignee {
  id: string;
  name: string;
  hue: number;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** YYYY-MM-DD, локальна дата */
  deadline: string | null;
  projectId: string;
  projectName: string;
  assigneeId: string;
  assignee: TaskAssignee;
  createdById: string;
  subtasks: Subtask[];
}
