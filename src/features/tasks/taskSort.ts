import { PRIORITIES, STATUS_META } from './constants';
import type { ArchiveListItem, Priority, Task, TasksSortField, TasksViewTabId } from './types';

export const TASKS_SORT_BY_TAB_STORAGE_KEY = 'tasks-sort-by-tab';

export const TASKS_SORT_OPTIONS: TasksSortField[] = ['deadline', 'status', 'priority'];

export const TASKS_SORT_LABELS: Record<TasksSortField, string> = {
  deadline: 'За дедлайном',
  status: 'За статусом',
  priority: 'За пріоритетом',
};

export const TASKS_SORT_SHORT: Record<TasksSortField, string> = {
  deadline: 'Дедлайн',
  status: 'Статус',
  priority: 'Пріоритет',
};

/** Порядок за замовчуванням для кожної вкладки. */
export const TAB_DEFAULT_SORT: Record<TasksViewTabId, TasksSortField> = {
  'by-date': 'priority',
  'by-area': 'status',
  personal: 'deadline',
  delegated: 'deadline',
  archive: 'deadline',
};

const NO_PRIORITY_RANK = 99;

function deadlineSortKey(iso: string | null): number {
  if (!iso) return Number.MAX_SAFE_INTEGER;
  const datePart = iso.split('T')[0];
  const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    return Number.MAX_SAFE_INTEGER;
  }
  const hasTime = iso.includes('T');
  const time = hasTime ? new Date(iso).getTime() : dt.getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function priorityRank(priority: Priority | null): number {
  if (!priority) return NO_PRIORITY_RANK;
  return PRIORITIES[priority].rank;
}

type TaskSortable = {
  status: Task['status'];
  priority: Task['priority'];
  deadline: Task['deadline'];
  sortKey: string;
};

function taskSortableFromTask(task: Pick<Task, 'id' | 'status' | 'priority' | 'deadline'>): TaskSortable {
  return { status: task.status, priority: task.priority, deadline: task.deadline, sortKey: task.id };
}

export function compareTasksBySort(a: TaskSortable, b: TaskSortable, sort: TasksSortField): number {
  switch (sort) {
    case 'deadline': {
      const diff = deadlineSortKey(a.deadline) - deadlineSortKey(b.deadline);
      if (diff !== 0) return diff;
      break;
    }
    case 'status': {
      const diff = STATUS_META[a.status].rank - STATUS_META[b.status].rank;
      if (diff !== 0) return diff;
      break;
    }
    case 'priority': {
      const diff = priorityRank(a.priority) - priorityRank(b.priority);
      if (diff !== 0) return diff;
      break;
    }
  }
  return a.sortKey.localeCompare(b.sortKey);
}

export function sortTasks<T extends Task>(tasks: T[], sort: TasksSortField): T[] {
  return [...tasks].sort((a, b) =>
    compareTasksBySort(taskSortableFromTask(a), taskSortableFromTask(b), sort),
  );
}

export function getDefaultSortForTab(tab: TasksViewTabId): TasksSortField {
  return TAB_DEFAULT_SORT[tab];
}

function readSortByTabMap(): Partial<Record<TasksViewTabId, TasksSortField>> {
  try {
    const raw = sessionStorage.getItem(TASKS_SORT_BY_TAB_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<TasksViewTabId, TasksSortField>>;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Partial<Record<TasksViewTabId, TasksSortField>> = {};
    for (const tab of Object.keys(TAB_DEFAULT_SORT) as TasksViewTabId[]) {
      const v = parsed[tab];
      if (v && TASKS_SORT_OPTIONS.includes(v)) out[tab] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function readTasksSortForTab(tab: TasksViewTabId): TasksSortField {
  const map = readSortByTabMap();
  return map[tab] ?? getDefaultSortForTab(tab);
}

export function writeTasksSortForTab(tab: TasksViewTabId, sort: TasksSortField): void {
  try {
    const map = readSortByTabMap();
    map[tab] = sort;
    sessionStorage.setItem(TASKS_SORT_BY_TAB_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
