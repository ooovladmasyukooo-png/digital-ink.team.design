export type TasksViewTabId = 'by-date' | 'by-area' | 'personal' | 'delegated' | 'archive';

export type Status = 'inbox' | 'new' | 'doing' | 'control' | 'done' | 'archive';
export type Priority = 'high' | 'medium' | 'low';

export type DateGroupId = 'overdue' | 'today' | 'tomorrow' | 'week' | 'later' | 'none';

/** Група в архіві за датою виконання (від найновіших). */
export type ArchiveGroupId = 'today' | 'yesterday' | 'week' | 'month' | 'earlier';

/** 0 = понеділок … 6 = неділя (як у календарі дедлайну). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TaskRecurrenceKind = 'daily' | 'weekly' | 'monthly';

/** Правило повторення після виконання задачі. */
export type TaskRecurrenceRule =
  | { kind: 'daily'; weekdays: Weekday[] }
  | { kind: 'weekly'; weekday: Weekday }
  | { kind: 'monthly'; mode: 'dayOfMonth'; day: number }
  | { kind: 'monthly'; mode: 'everyNDays'; intervalDays: number };

/** Старий формат (лише для міграції збережених даних). */
export type LegacyTaskRecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  assigneeIds: string[];
  /** null — успадковує проєкт головної задачі */
  projectId: string | null;
  /** YYYY-MM-DD або YYYY-MM-DDTHH:mm */
  deadline: string | null;
  /** ISO datetime — коли відмічено Done / Archive */
  completedAt: string | null;
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
  /** YYYY-MM-DD або YYYY-MM-DDTHH:mm */
  deadline: string | null;
  /** ISO datetime — коли відмічено Done / Archive */
  completedAt: string | null;
  /** Після статусу Done автоматично створюється нова копія. */
  recurrenceRule: TaskRecurrenceRule | null;
  assigneeIds: string[];
  /** Хто створив / делегував задачу */
  creatorId: string;
  /** ISO datetime — коли задачу створено */
  createdAt: string;
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
    | 'completedAt'
    | 'recurrenceRule'
    | 'assigneeIds'
    | 'creatorId'
    | 'createdAt'
    | 'projectId'
    | 'description'
    | 'checkItems'
    | 'subtasks'
    | 'comments'
    | 'activityLog'
  >
>;

/** Рядок у вкладці «Архів» — задача або підзадача. */
export interface ArchiveListItem {
  rowKey: string;
  rootTaskId: string;
  subtaskPath: string[];
  isSubtask: boolean;
  parentTitle: string | null;
  rootTitle: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority | null;
  deadline: string | null;
  completedAt: string;
  assigneeIds: string[];
  /** Хто створив / делегував задачу */
  creatorId: string;
  projectId: string | null;
}
