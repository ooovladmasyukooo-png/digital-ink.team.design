import {
  compareSprintsByStart,
  getSprintPhase,
  SPRINT_PHASE_LABELS,
  SPRINT_PHASE_ORDER,
  type Sprint,
} from './sprints';
import { taskForActiveList } from './taskCompletion';
import { sortTasks } from './taskSort';
import { passesViewerAssigneeFilter } from './taskViewer';
import type { SprintPhaseId, Task, TasksSortField } from './types';

export type SprintTaskGroup = {
  sprint: Sprint;
  tasks: Task[];
};

export type SprintPhaseGroup = {
  phase: SprintPhaseId;
  label: string;
  sprints: SprintTaskGroup[];
  taskCount: number;
};

export function buildSprintPhaseGroups(
  sprints: Sprint[],
  tasks: Task[],
  viewerId: string,
  sort: TasksSortField = 'priority',
): SprintPhaseGroup[] {
  const buckets = new Map<string, Task[]>();
  for (const sprint of sprints) {
    buckets.set(sprint.id, []);
  }

  for (const task of tasks) {
    if (!task.sprintId || task.status === 'archive') continue;
    if (!passesViewerAssigneeFilter(task, viewerId)) continue;
    const list = buckets.get(task.sprintId);
    if (!list) continue;
    list.push(task);
  }

  const byPhase = new Map<SprintPhaseId, SprintTaskGroup[]>();
  for (const phase of SPRINT_PHASE_ORDER) {
    byPhase.set(phase, []);
  }

  for (const sprint of sprints) {
    const phase = getSprintPhase(sprint);
    const raw = buckets.get(sprint.id) ?? [];
    byPhase.get(phase)?.push({
      sprint,
      tasks: sortTasks(raw, sort).map(taskForActiveList),
    });
  }

  return SPRINT_PHASE_ORDER.map((phase) => {
    const phaseSprints = [...(byPhase.get(phase) ?? [])].sort((a, b) =>
      compareSprintsByStart(a.sprint, b.sprint),
    );
    const taskCount = phaseSprints.reduce((sum, group) => sum + group.tasks.length, 0);
    return {
      phase,
      label: SPRINT_PHASE_LABELS[phase],
      sprints: phaseSprints,
      taskCount,
    };
  });
}
