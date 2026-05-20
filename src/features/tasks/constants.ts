import type { DateGroupId, Priority, Status, Task, TaskRecurrenceKind } from './types';
import { defaultDeadlineForGroup } from './dateGroups';

/** Демо: відповідає поточному користувачу в UI (Андрій Мельник). */
export const TASK_CREATOR_ASSIGNEE_ID = 'andrii';

export type Stage = 'todo' | 'inprogress' | 'complete';

export type StatusTone = 'slate' | 'gray' | 'blue' | 'purple' | 'green';

export const STATUS_META: Record<
  Status,
  { stage: Stage; label: string; rank: number; tone: StatusTone }
> = {
  inbox: { stage: 'todo', label: 'Inbox', rank: 0, tone: 'slate' },
  new: { stage: 'todo', label: 'New', rank: 1, tone: 'gray' },
  doing: { stage: 'inprogress', label: 'Doing', rank: 2, tone: 'blue' },
  control: { stage: 'inprogress', label: 'Control', rank: 3, tone: 'purple' },
  done: { stage: 'complete', label: 'Done', rank: 4, tone: 'green' },
  archive: { stage: 'complete', label: 'Archive', rank: 5, tone: 'slate' },
};

export const PRIORITIES: Record<Priority, { label: string; short: string; rank: number; tone: 'red' | 'blue' | 'gray' }> = {
  high: { label: 'High', short: 'High', rank: 0, tone: 'red' },
  medium: { label: 'Medium', short: 'Med.', rank: 1, tone: 'blue' },
  low: { label: 'Low', short: 'Low', rank: 2, tone: 'gray' },
};

export const STATUS_OPTIONS = (Object.keys(STATUS_META) as Status[]).sort(
  (a, b) => STATUS_META[a].rank - STATUS_META[b].rank,
);

export const PRIORITY_OPTIONS = (Object.keys(PRIORITIES) as Priority[]).sort(
  (a, b) => PRIORITIES[a].rank - PRIORITIES[b].rank,
);

export const RECURRENCE_KIND_OPTIONS: { kind: TaskRecurrenceKind; label: string }[] = [
  { kind: 'daily', label: 'По днях тижня' },
  { kind: 'weekly', label: 'Щотижня' },
  { kind: 'monthly', label: 'Щомісяця' },
];

export const RECURRENCE_WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'] as const;

export function createNewTaskForPersonalStatus(
  status: Status,
  id: string,
  assigneeId = TASK_CREATOR_ASSIGNEE_ID,
): Task {
  return {
    ...createNewTaskForProject(null, id, assigneeId),
    status,
    assigneeIds: [assigneeId],
  };
}

/** Задача профілю спеціаліста: відповідальний — обраний учасник команди. */
export function createNewTaskForMemberStatus(status: Status, id: string, memberId: string): Task {
  return {
    ...createNewTaskForProject(null, id),
    status,
    assigneeIds: [memberId],
    creatorId: TASK_CREATOR_ASSIGNEE_ID,
  };
}

/** Делегована: автор — поточний користувач, відповідальний — інший (демо: Дарія). */
export function createNewTaskForDelegatedStatus(
  status: Status,
  id: string,
  creatorId = TASK_CREATOR_ASSIGNEE_ID,
): Task {
  const assigneeId = creatorId === TASK_CREATOR_ASSIGNEE_ID ? 'daria' : TASK_CREATOR_ASSIGNEE_ID;
  return {
    ...createNewTaskForProject(null, id, assigneeId, creatorId),
    status,
    assigneeIds: [assigneeId],
    creatorId,
  };
}

export function createNewTaskForProject(
  projectId: string | null,
  id: string,
  assigneeId = TASK_CREATOR_ASSIGNEE_ID,
  creatorId = TASK_CREATOR_ASSIGNEE_ID,
): Task {
  return {
    id,
    title: 'Нова задача',
    status: 'inbox',
    priority: null,
    deadline: null,
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: [assigneeId],
    creatorId,
    createdAt: new Date().toISOString(),
    projectId,
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  };
}

export function createNewTaskForGroup(
  groupId: DateGroupId,
  id: string,
  now = new Date(),
  assigneeId = TASK_CREATOR_ASSIGNEE_ID,
): Task {
  return {
    ...createNewTaskForProject(null, id, assigneeId),
    deadline: defaultDeadlineForGroup(groupId, now),
  };
}
