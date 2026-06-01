import { TASKS_SORT_OPTIONS } from './taskSort';
import type { TasksSortField } from './types';

export const PROJECT_TASKS_SORT_STORAGE_KEY = 'project-tasks-sort';
export const PROJECT_TASKS_DEFAULT_SORT: TasksSortField = 'priority';

function isValidSort(value: unknown): value is TasksSortField {
  return typeof value === 'string' && TASKS_SORT_OPTIONS.includes(value as TasksSortField);
}

export function readProjectTasksSort(): TasksSortField {
  try {
    const raw = sessionStorage.getItem(PROJECT_TASKS_SORT_STORAGE_KEY);
    if (raw && isValidSort(raw)) return raw;
  } catch {
    /* ignore */
  }
  return PROJECT_TASKS_DEFAULT_SORT;
}

export function writeProjectTasksSort(sort: TasksSortField): void {
  try {
    sessionStorage.setItem(PROJECT_TASKS_SORT_STORAGE_KEY, sort);
  } catch {
    /* ignore */
  }
}
