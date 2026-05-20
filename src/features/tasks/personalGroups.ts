import { TASK_CREATOR_ASSIGNEE_ID } from './constants';
import { buildStatusTabGroups, TASK_STATUS_TAB_ORDER } from './statusTaskGroups';
import type { Task } from './types';

export { TASK_STATUS_TAB_ORDER as PERSONAL_STATUS_ORDER };
export type { StatusTaskGroup as PersonalStatusGroup } from './statusTaskGroups';

/** Особиста задача: без проєкту, поточний користувач у відповідальних. */
export function isPersonalTask(task: Task, userId = TASK_CREATOR_ASSIGNEE_ID): boolean {
  if (task.status === 'archive') return false;
  if (task.projectId !== null) return false;
  return task.assigneeIds.includes(userId);
}

export function buildPersonalGroups(tasks: Task[], userId = TASK_CREATOR_ASSIGNEE_ID) {
  return buildStatusTabGroups(tasks, (task) => isPersonalTask(task, userId));
}
