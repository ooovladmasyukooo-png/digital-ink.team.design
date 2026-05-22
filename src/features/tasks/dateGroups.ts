import { TASK_CREATOR_ASSIGNEE_ID } from './constants';
import { isCompletedStatus } from './taskCompletion';
import { passesViewerAssigneeFilter } from './taskViewer';
import type { DateGroupId, Priority, Task } from './types';

/** Відповідає rank у PRIORITIES (constants.ts): high → low, без пріоритету — в кінці. */
const PRIORITY_SORT_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const NO_PRIORITY_SORT_RANK = 99;

const DATE_GROUPS_BY_PRIORITY: DateGroupId[] = ['overdue', 'today', 'tomorrow'];

function compareTasksByPriority(a: Task, b: Task): number {
  const rankA = a.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[a.priority];
  const rankB = b.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[b.priority];
  if (rankA !== rankB) return rankA - rankB;
  return a.id.localeCompare(b.id);
}

export const DATE_GROUP_ORDER: DateGroupId[] = ['overdue', 'today', 'tomorrow', 'week', 'later', 'none'];

export const DATE_GROUP_LABELS: Record<DateGroupId, string> = {
  overdue: 'Прострочені',
  today: 'Сьогодні',
  tomorrow: 'Завтра',
  week: 'На цьому тижні',
  later: 'Пізніше',
  none: 'Без дедлайну',
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIsoDate(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return startOfDay(dt);
}

export function getTaskDateGroup(deadline: string | null, now = new Date()): DateGroupId {
  if (!deadline) return 'none';

  const d = parseIsoDate(deadline);
  if (!d) return 'none';

  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const day = today.getDay();
  const mondayOffset = (day + 6) % 7;
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + (6 - mondayOffset));

  if (d < today) return 'overdue';
  if (d.getTime() === today.getTime()) return 'today';
  if (d.getTime() === tomorrow.getTime()) return 'tomorrow';
  if (d <= weekEnd) return 'week';
  return 'later';
}

export function defaultDeadlineForGroup(groupId: DateGroupId, now = new Date()): string | null {
  const today = startOfDay(now);
  const iso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  switch (groupId) {
    case 'overdue': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return iso(yesterday);
    }
    case 'today':
      return iso(today);
    case 'tomorrow': {
      const t = new Date(today);
      t.setDate(t.getDate() + 1);
      return iso(t);
    }
    default:
      return null;
  }
}

export function groupTasksByDate(
  tasks: Task[],
  now = new Date(),
  viewerId = TASK_CREATOR_ASSIGNEE_ID,
): Record<DateGroupId, Task[]> {
  const buckets = Object.fromEntries(DATE_GROUP_ORDER.map((id) => [id, [] as Task[]])) as Record<
    DateGroupId,
    Task[]
  >;

  for (const task of tasks) {
    if (isCompletedStatus(task.status)) continue;
    if (!passesViewerAssigneeFilter(task, viewerId)) continue;
    const group = getTaskDateGroup(task.deadline, now);
    buckets[group].push(task);
  }

  for (const groupId of DATE_GROUPS_BY_PRIORITY) {
    buckets[groupId].sort(compareTasksByPriority);
  }

  return buckets;
}
