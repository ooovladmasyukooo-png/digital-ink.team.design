import type { DesignBrief, DesignBriefPatch, DesignBriefSubtask } from './types';

export function getSubtaskAtPath(root: DesignBrief, path: string[]): DesignBriefSubtask | null {
  let list = root.subtasks;
  let found: DesignBriefSubtask | undefined;
  for (const id of path) {
    found = list.find((s) => s.id === id);
    if (!found) return null;
    list = found.subtasks;
  }
  return found ?? null;
}

export function getParentTaskLink(
  root: DesignBrief,
  path: string[],
): Pick<DesignBrief, 'id' | 'title'> | null {
  if (path.length === 0) return null;
  if (path.length === 1) return { id: root.id, title: root.title };
  const parent = getSubtaskAtPath(root, path.slice(0, -1));
  return parent ? { id: parent.id, title: parent.title } : null;
}

export function designBriefFromSubtask(subtask: DesignBriefSubtask, root: DesignBrief): DesignBrief {
  return {
    id: subtask.id,
    title: subtask.title,
    status: subtask.status,
    priority: subtask.priority,
    deadline: subtask.deadline,
    completedAt: subtask.completedAt,
    assigneeIds: subtask.assigneeIds,
    creatorId: root.creatorId,
    createdAt: root.createdAt,
    recurrenceRule: null,
    projectId: subtask.projectId ?? root.projectId,
    format: null,
    sizes: [],
    referenceLinks: [],
    copyVariants: [],
    description: subtask.description,
    checkItems: subtask.checkItems,
    subtasks: subtask.subtasks,
    comments: [],
    activityLog: [],
  };
}

export function applyPatchAtSubtaskPath(
  subtasks: DesignBriefSubtask[],
  path: string[],
  patch: DesignBriefPatch,
): DesignBriefSubtask[] {
  const [head, ...tail] = path;
  const subPatch = subtaskPatchFromDesignBriefPatch(patch);

  if (tail.length === 0) {
    return subtasks.map((s) =>
      s.id === head
        ? {
            ...s,
            ...subPatch,
            ...(patch.subtasks !== undefined ? { subtasks: patch.subtasks } : {}),
          }
        : s,
    );
  }

  return subtasks.map((s) =>
    s.id === head ? { ...s, subtasks: applyPatchAtSubtaskPath(s.subtasks, tail, patch) } : s,
  );
}

export function subtaskPatchFromDesignBriefPatch(patch: DesignBriefPatch): Partial<DesignBriefSubtask> {
  const out: Partial<DesignBriefSubtask> = {};
  if (patch.title !== undefined) out.title = patch.title;
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.priority !== undefined) out.priority = patch.priority;
  if (patch.deadline !== undefined) out.deadline = patch.deadline;
  if (patch.completedAt !== undefined) out.completedAt = patch.completedAt;
  if (patch.assigneeIds !== undefined) out.assigneeIds = patch.assigneeIds;
  if (patch.projectId !== undefined) out.projectId = patch.projectId;
  if (patch.description !== undefined) out.description = patch.description;
  if (patch.checkItems !== undefined) out.checkItems = patch.checkItems;
  return out;
}

export function isSubtaskDone(subtask: DesignBriefSubtask): boolean {
  return subtask.status === 'done' || subtask.status === 'archive';
}

export function resolveSubtaskProjectId(
  subtask: Pick<DesignBriefSubtask, 'projectId'>,
  rootProjectId: string | null,
): string | null {
  return subtask.projectId ?? rootProjectId;
}

export function createNewDesignBriefSubtask(projectId: string | null, id?: string): DesignBriefSubtask {
  return {
    id: id ?? `s${Date.now()}`,
    title: 'Нова підзадача',
    status: 'new',
    priority: null,
    assigneeIds: [],
    projectId,
    deadline: null,
    completedAt: null,
    description: '',
    checkItems: [],
    subtasks: [],
  };
}

/** Додає підзадачу до списку за шляхом батька (порожній path = кореневі підзадачі задачі). */
export function appendSubtaskAtPath(
  subtasks: DesignBriefSubtask[],
  parentPath: string[],
  newSubtask: DesignBriefSubtask,
): DesignBriefSubtask[] {
  if (parentPath.length === 0) return [...subtasks, newSubtask];
  const [head, ...tail] = parentPath;
  return subtasks.map((s) =>
    s.id === head ? { ...s, subtasks: appendSubtaskAtPath(s.subtasks, tail, newSubtask) } : s,
  );
}

/** Видаляє підзадачу за шляхом (перший id — прямий нащадок кореневої задачі). */
export function removeSubtaskAtPath(subtasks: DesignBriefSubtask[], path: string[]): DesignBriefSubtask[] {
  if (path.length === 0) return subtasks;
  const [head, ...tail] = path;
  if (tail.length === 0) return subtasks.filter((s) => s.id !== head);
  return subtasks.map((s) =>
    s.id === head ? { ...s, subtasks: removeSubtaskAtPath(s.subtasks, tail) } : s,
  );
}
