import { TASK_CREATOR_ASSIGNEE_ID } from './constants';
import { buildStatusTabGroups, TASK_STATUS_TAB_ORDER } from './statusTaskGroups';
import { isTasksViewerAll } from './taskViewer';
import type { Task, TasksSortField } from './types';

export { TASK_STATUS_TAB_ORDER as DELEGATED_STATUS_ORDER };
export type { StatusTaskGroup as DelegatedStatusGroup } from './statusTaskGroups';

/** Делегована: створив поточний користувач, відповідальні — інші (не лише він). */
export function isDelegatedTask(task: Task, userId = TASK_CREATOR_ASSIGNEE_ID): boolean {
  if (task.status === 'archive') return false;
  if (task.creatorId !== userId) return false;
  return task.assigneeIds.some((id) => id !== userId);
}

/** Делегована будь-ким: відповідальні не збігаються з автором. */
export function isTeamDelegatedTask(task: Task): boolean {
  if (task.status === 'archive') return false;
  return task.assigneeIds.some((id) => id !== task.creatorId);
}

export function buildDelegatedGroups(
  tasks: Task[],
  viewerId = TASK_CREATOR_ASSIGNEE_ID,
  sort: TasksSortField = 'priority',
) {
  const match = isTasksViewerAll(viewerId)
    ? isTeamDelegatedTask
    : (task: Task) => isDelegatedTask(task, viewerId);
  return buildStatusTabGroups(tasks, match, sort);
}
