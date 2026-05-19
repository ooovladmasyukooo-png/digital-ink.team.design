export type TasksViewTabId = 'by-date' | 'by-area' | 'personal' | 'delegated' | 'archive';

export type Status = 'inbox' | 'new' | 'doing' | 'control' | 'done' | 'archive';
export type Priority = 'high' | 'medium' | 'low';

export type DateGroupId = 'overdue' | 'today' | 'tomorrow' | 'week' | 'later' | 'none';

export interface TaskCheckItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TaskSubtask {
  id: string;
  title: string;
  status: Status;
  priority: Priority | null;
  assigneeId: string | null;
  /** YYYY-MM-DD або null */
  deadline: string | null;
  description: string;
  checkItems: TaskCheckItem[];
  subtasks: TaskSubtask[];
}

export interface TaskActivityEntry {
  id: string;
  /** ISO datetime */
  at: string;
  actorId: string | null;
  text: string;
}

export interface TaskComment {
  id: string;
  /** ISO datetime */
  at: string;
  authorId: string;
  body: string;
  mentionIds?: string[];
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority | null;
  /** YYYY-MM-DD або null */
  deadline: string | null;
  assigneeId: string | null;
  projectId: string | null;
  description: string;
  checkItems: TaskCheckItem[];
  subtasks: TaskSubtask[];
  comments: TaskComment[];
  activityLog: TaskActivityEntry[];
}

export type TaskPatch = Partial<
  Pick<
    Task,
    | 'title'
    | 'status'
    | 'priority'
    | 'deadline'
    | 'assigneeId'
    | 'projectId'
    | 'description'
    | 'checkItems'
    | 'subtasks'
    | 'comments'
    | 'activityLog'
  >
>;
