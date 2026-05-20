import { TASK_CREATOR_ASSIGNEE_ID } from './constants';
import type { Task } from './types';

/** Режим «Усі» — задачі всієї команди без фільтра за відповідальним. */
export const TASKS_VIEWER_ALL_ID = '__all__';

/** Чи це режим «мої» задачі (поточний користувач). */
export function isTasksViewerSelf(viewerId: string): boolean {
  return viewerId === TASK_CREATOR_ASSIGNEE_ID;
}

export function isTasksViewerAll(viewerId: string): boolean {
  return viewerId === TASKS_VIEWER_ALL_ID;
}

export function isTaskAssignedToViewer(task: Task, viewerId: string): boolean {
  return task.assigneeIds.includes(viewerId);
}

/** Усі вкладки: лише задачі, де обраний спеціаліст у відповідальних (крім режиму «Усі»). */
export function passesViewerAssigneeFilter(task: Task, viewerId: string): boolean {
  if (isTasksViewerAll(viewerId)) return true;
  return isTaskAssignedToViewer(task, viewerId);
}
