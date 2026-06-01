import { buildStatusTabGroups } from './statusTaskGroups';
import type { Task, TasksSortField } from './types';

/** Задача цього проєкту (без архіву). */
export function isProjectTask(task: Task, projectId: string): boolean {
  if (task.status === 'archive') return false;
  return task.projectId === projectId;
}

/** Унікальні відповідальні серед задач проєкту (стабільний порядок). */
export function collectProjectAssigneeIds(tasks: Task[], projectId: string): string[] {
  const ids = new Set<string>();
  for (const task of tasks) {
    if (!isProjectTask(task, projectId)) continue;
    for (const id of task.assigneeIds) ids.add(id);
  }
  return [...ids].sort((a, b) => a.localeCompare(b));
}

function matchesProjectAssigneeFilter(task: Task, assigneeId: string | null): boolean {
  if (assigneeId === null) return true;
  return task.assigneeIds.includes(assigneeId);
}

/** Групи за статусом; порожні не включаються. */
export function buildProjectStatusGroups(
  tasks: Task[],
  projectId: string,
  sort: TasksSortField = 'priority',
  assigneeId: string | null = null,
) {
  return buildStatusTabGroups(
    tasks,
    (task) => isProjectTask(task, projectId) && matchesProjectAssigneeFilter(task, assigneeId),
    sort,
  ).filter((group) => group.tasks.length > 0);
}
