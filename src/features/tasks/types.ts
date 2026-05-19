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
  /** Чернетка під час inline-створення підзадачі */
  isDraft?: boolean;
  /** Власний статус; якщо undefined — виводимо з `done`. */
  status?: TaskStatus;
  /** Власний пріоритет; якщо undefined — порожній прапорець. */
  priority?: TaskPriority;
  /** Власний дедлайн (YYYY-MM-DD) або null. */
  deadline?: string | null;
  /** Кому призначена підзадача; якщо undefined — успадковується відповідальний батьківської задачі. */
  assigneeId?: string;
  assignee?: TaskAssignee;
  /** Вкладені підзадачі (рекурсивно, довільна глибина). */
  subtasks?: Subtask[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  /** Чернетка під час inline-створення (pick-up рядок) */
  isDraft?: boolean;
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
