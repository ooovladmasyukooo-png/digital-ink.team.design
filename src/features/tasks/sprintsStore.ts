import { DEFAULT_SPRINT_PHASE, deriveSprintPhaseFromDates, initialSprints, type Sprint } from './sprints';

/** Демо-автор — збігається з TASK_CREATOR_ASSIGNEE_ID у constants.ts */
const DEFAULT_SPRINT_CREATOR_ID = 'andrii';

export type SprintPatch = Partial<
  Pick<
    Sprint,
    | 'title'
    | 'phase'
    | 'startDate'
    | 'endDate'
    | 'priority'
    | 'assigneeIds'
    | 'description'
    | 'comments'
    | 'activityLog'
  >
>;

function normalizeSprint(sprint: Sprint): Sprint {
  return {
    ...sprint,
    title: sprint.title ?? '',
    description: sprint.description ?? '',
    priority: sprint.priority ?? null,
    assigneeIds: sprint.assigneeIds ?? [],
    creatorId: sprint.creatorId ?? DEFAULT_SPRINT_CREATOR_ID,
    createdAt: sprint.createdAt ?? new Date().toISOString(),
    comments: sprint.comments ?? [],
    activityLog: sprint.activityLog ?? [],
    phase: sprint.phase ?? deriveSprintPhaseFromDates(sprint) ?? DEFAULT_SPRINT_PHASE,
  };
}

let sprintsState: Sprint[] = initialSprints.map(normalizeSprint);
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSprints(): Sprint[] {
  return sprintsState;
}

export function getSprintById(sprintId: string): Sprint | undefined {
  return sprintsState.find((sprint) => sprint.id === sprintId);
}

export function updateSprint(sprintId: string, patch: SprintPatch): void {
  sprintsState = sprintsState.map((sprint) =>
    sprint.id === sprintId ? normalizeSprint({ ...sprint, ...patch }) : sprint,
  );
  emit();
}

export function deleteSprint(sprintId: string): void {
  sprintsState = sprintsState.filter((sprint) => sprint.id !== sprintId);
  emit();
}

export function subscribeSprints(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
