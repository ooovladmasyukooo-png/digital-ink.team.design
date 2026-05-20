import { PRIORITIES, STATUS_META } from './constants';
import { taskForActiveList } from './taskCompletion';
import type { Priority, Status, Task } from './types';

const PRIORITY_SORT_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const NO_PRIORITY_SORT_RANK = 99;

export const TASK_STATUS_TAB_ORDER: Status[] = ['inbox', 'new', 'doing', 'control', 'done'];

export type StatusTaskGroup = {
  status: Status;
  label: string;
  tasks: Task[];
};

function compareTasksByPriority(a: Task, b: Task): number {
  const rankA = a.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[a.priority];
  const rankB = b.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[b.priority];
  if (rankA !== rankB) return rankA - rankB;
  return a.id.localeCompare(b.id);
}

export function buildStatusTabGroups(
  tasks: Task[],
  matches: (task: Task) => boolean,
): StatusTaskGroup[] {
  const buckets = new Map<Status, Task[]>();
  for (const status of TASK_STATUS_TAB_ORDER) {
    buckets.set(status, []);
  }

  for (const task of tasks) {
    if (!matches(task)) continue;
    const list = buckets.get(task.status);
    if (!list) continue;
    list.push(task);
  }

  return TASK_STATUS_TAB_ORDER.map((status) => {
    const raw = buckets.get(status) ?? [];
    return {
      status,
      label: STATUS_META[status].label,
      tasks: [...raw].sort(compareTasksByPriority).map(taskForActiveList),
    };
  });
}
