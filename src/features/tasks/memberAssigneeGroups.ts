import { PRIORITIES, STATUS_META } from './constants';
import { taskForActiveList } from './taskCompletion';
import { TASK_STATUS_TAB_ORDER, type StatusTaskGroup } from './statusTaskGroups';
import type { Priority, Status, Task } from './types';

const PRIORITY_SORT_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const NO_PRIORITY_SORT_RANK = 99;

function compareTasksByPriority(a: Task, b: Task): number {
  const rankA = a.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[a.priority];
  const rankB = b.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[b.priority];
  if (rankA !== rankB) return rankA - rankB;
  return a.id.localeCompare(b.id);
}

function completedAtTimestamp(completedAt: string | null): number {
  if (!completedAt) return 0;
  const t = new Date(completedAt).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Done: від найновішого виконання до найстарішого. */
function compareDoneTasks(a: Task, b: Task): number {
  const diff = completedAtTimestamp(b.completedAt) - completedAtTimestamp(a.completedAt);
  if (diff !== 0) return diff;
  return a.id.localeCompare(b.id);
}

function sortGroupTasks(status: Status, tasks: Task[]): Task[] {
  const sorted =
    status === 'done' ? [...tasks].sort(compareDoneTasks) : [...tasks].sort(compareTasksByPriority);
  return sorted.map(taskForActiveList);
}

/** Задача, де спеціаліст у відповідальних (будь-який проєкт, без архіву). */
export function isMemberAssigneeTask(task: Task, memberId: string): boolean {
  if (task.status === 'archive') return false;
  return task.assigneeIds.includes(memberId);
}

/** Групи за статусом; порожні не включаються. */
export function buildMemberAssigneeGroups(tasks: Task[], memberId: string): StatusTaskGroup[] {
  const buckets = new Map<Status, Task[]>();
  for (const status of TASK_STATUS_TAB_ORDER) {
    buckets.set(status, []);
  }

  for (const task of tasks) {
    if (!isMemberAssigneeTask(task, memberId)) continue;
    const list = buckets.get(task.status);
    if (!list) continue;
    list.push(task);
  }

  return TASK_STATUS_TAB_ORDER.flatMap((status) => {
    const raw = buckets.get(status) ?? [];
    if (raw.length === 0) return [];
    return [
      {
        status,
        label: STATUS_META[status].label,
        tasks: sortGroupTasks(status, raw),
      },
    ];
  });
}
