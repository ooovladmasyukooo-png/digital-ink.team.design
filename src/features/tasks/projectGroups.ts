import { projects } from '../projects2/data';
import { TASK_CREATOR_ASSIGNEE_ID } from './constants';
import { taskForActiveList } from './taskCompletion';
import { projectById } from './taskOptions';
import { sortTasks } from './taskSort';
import { passesViewerAssigneeFilter } from './taskViewer';
import type { Task, TasksSortField } from './types';

export type ProjectGroup = {
  id: string;
  projectId: string | null;
  /** Коротка назва в заголовку групи (username). */
  label: string;
  /** Повна назва для підказки. */
  fullLabel: string;
  tasks: Task[];
};

export function projectGroupLabels(projectId: string | null): { label: string; fullLabel: string } {
  if (!projectId) return { label: 'Без проєкту', fullLabel: 'Без проєкту' };
  const p = projectById[projectId];
  if (!p) return { label: projectId, fullLabel: projectId };
  return { label: p.username, fullLabel: p.name };
}

/** Групи за проєктом; у групі — від Inbox до Done (без Archive). */
export function buildProjectGroups(
  tasks: Task[],
  viewerId = TASK_CREATOR_ASSIGNEE_ID,
  sort: TasksSortField = 'status',
): ProjectGroup[] {
  const buckets = new Map<string, Task[]>();

  for (const task of tasks) {
    if (task.status === 'archive') continue;
    if (!passesViewerAssigneeFilter(task, viewerId)) continue;
    if (!task.projectId) continue;
    const list = buckets.get(task.projectId) ?? [];
    list.push(task);
    buckets.set(task.projectId, list);
  }

  const orderedKeys: string[] = [
    ...projects.map((p) => p.id),
    ...[...buckets.keys()].filter((k) => !projects.some((p) => p.id === k)),
  ];

  const seen = new Set<string>();
  const groups: ProjectGroup[] = [];

  for (const key of orderedKeys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const raw = buckets.get(key);
    if (!raw?.length) continue;

    const projectId = key;
    const sorted = sortTasks(raw, sort).map(taskForActiveList);

    const { label, fullLabel } = projectGroupLabels(projectId);
    groups.push({
      id: key,
      projectId,
      label,
      fullLabel,
      tasks: sorted,
    });
  }

  return groups;
}
