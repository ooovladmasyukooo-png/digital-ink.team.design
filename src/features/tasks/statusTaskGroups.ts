import { STATUS_META } from './constants';
import { taskForActiveList } from './taskCompletion';
import { sortTasks } from './taskSort';
import type { Status, Task, TasksSortField } from './types';

export const TASK_STATUS_TAB_ORDER: Status[] = ['inbox', 'new', 'doing', 'control', 'done'];

export type StatusTaskGroup = {
  status: Status;
  label: string;
  tasks: Task[];
};

export function buildStatusTabGroups(
  tasks: Task[],
  matches: (task: Task) => boolean,
  sort: TasksSortField = 'priority',
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
      tasks: sortTasks(raw, sort).map(taskForActiveList),
    };
  });
}
