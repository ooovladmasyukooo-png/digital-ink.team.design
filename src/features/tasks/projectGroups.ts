import { projects } from '../projects2/data';
import { PRIORITIES, STATUS_META, TASK_CREATOR_ASSIGNEE_ID } from './constants';
import { taskForActiveList } from './taskCompletion';
import { projectById } from './taskOptions';
import { passesViewerAssigneeFilter } from './taskViewer';
import type { Priority, Task } from './types';

export const NO_PROJECT_GROUP_ID = '__none__';

const PRIORITY_SORT_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const NO_PRIORITY_SORT_RANK = 99;

export type ProjectGroup = {
  id: string;
  projectId: string | null;
  /** Коротка назва в заголовку групи (username). */
  label: string;
  /** Повна назва для підказки. */
  fullLabel: string;
  tasks: Task[];
};

function compareTasksByStatusThenPriority(a: Task, b: Task): number {
  const statusDiff = STATUS_META[a.status].rank - STATUS_META[b.status].rank;
  if (statusDiff !== 0) return statusDiff;

  const rankA = a.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[a.priority];
  const rankB = b.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[b.priority];
  if (rankA !== rankB) return rankA - rankB;

  return a.id.localeCompare(b.id);
}

export function projectGroupLabels(projectId: string | null): { label: string; fullLabel: string } {
  if (!projectId) return { label: 'Без проєкту', fullLabel: 'Без проєкту' };
  const p = projectById[projectId];
  if (!p) return { label: projectId, fullLabel: projectId };
  return { label: p.username, fullLabel: p.name };
}

/** Групи за проєктом; у групі — від Inbox до Done (без Archive). */
export function buildProjectGroups(tasks: Task[], viewerId = TASK_CREATOR_ASSIGNEE_ID): ProjectGroup[] {
  const buckets = new Map<string, Task[]>();

  for (const task of tasks) {
    if (task.status === 'archive') continue;
    if (!passesViewerAssigneeFilter(task, viewerId)) continue;
    const key = task.projectId ?? NO_PROJECT_GROUP_ID;
    const list = buckets.get(key) ?? [];
    list.push(task);
    buckets.set(key, list);
  }

  const orderedKeys: string[] = [
    ...projects.map((p) => p.id),
    ...[...buckets.keys()].filter((k) => k !== NO_PROJECT_GROUP_ID && !projects.some((p) => p.id === k)),
    NO_PROJECT_GROUP_ID,
  ];

  const seen = new Set<string>();
  const groups: ProjectGroup[] = [];

  for (const key of orderedKeys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const raw = buckets.get(key);
    if (!raw?.length) continue;

    const projectId = key === NO_PROJECT_GROUP_ID ? null : key;
    const sorted = [...raw].sort(compareTasksByStatusThenPriority).map(taskForActiveList);

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
