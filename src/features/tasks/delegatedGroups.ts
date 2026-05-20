import { TASK_CREATOR_ASSIGNEE_ID } from './constants';
import { buildStatusTabGroups, TASK_STATUS_TAB_ORDER } from './statusTaskGroups';
import type { Task } from './types';

export { TASK_STATUS_TAB_ORDER as DELEGATED_STATUS_ORDER };
export type { StatusTaskGroup as DelegatedStatusGroup } from './statusTaskGroups';

/** Делегована: створив поточний користувач, відповідальні — інші (не лише він). */
export function isDelegatedTask(task: Task, userId = TASK_CREATOR_ASSIGNEE_ID): boolean {
  if (task.status === 'archive') return false;
  if (task.creatorId !== userId) return false;
  return task.assigneeIds.some((id) => id !== userId);
}

export function buildDelegatedGroups(tasks: Task[], userId = TASK_CREATOR_ASSIGNEE_ID) {
  return buildStatusTabGroups(tasks, (task) => isDelegatedTask(task, userId));
}
