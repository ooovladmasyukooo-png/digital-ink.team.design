import type { DateGroupId, Priority, Status, Task } from './types';
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

export function createNewTaskForGroup(groupId: DateGroupId, id: string, now = new Date()): Task {
  return {
    id,
    title: 'Нова задача',
    status: 'inbox',
    priority: null,
    deadline: defaultDeadlineForGroup(groupId, now),
    assigneeId: TASK_CREATOR_ASSIGNEE_ID,
    projectId: null,
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  };
}
