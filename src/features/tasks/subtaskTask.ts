import type { Task, TaskPatch, TaskSubtask } from './types';

export function getSubtaskAtPath(root: Task, path: string[]): TaskSubtask | null {
  let list = root.subtasks;
  let found: TaskSubtask | undefined;
  for (const id of path) {
    found = list.find((s) => s.id === id);
    if (!found) return null;
    list = found.subtasks;
  }
  return found ?? null;
}

export function getParentTaskLink(
  root: Task,
  path: string[],
): Pick<Task, 'id' | 'title'> | null {
  if (path.length === 0) return null;
  if (path.length === 1) return { id: root.id, title: root.title };
  const parent = getSubtaskAtPath(root, path.slice(0, -1));
  return parent ? { id: parent.id, title: parent.title } : null;
}

export function taskFromSubtask(subtask: TaskSubtask, root: Task): Task {
  return {
    id: subtask.id,
    title: subtask.title,
    status: subtask.status,
    priority: subtask.priority,
    deadline: subtask.deadline,
    assigneeId: subtask.assigneeId,
    projectId: root.projectId,
    description: subtask.description,
    checkItems: subtask.checkItems,
    subtasks: subtask.subtasks,
    comments: [],
    activityLog: [],
  };
}

export function applyPatchAtSubtaskPath(
  subtasks: TaskSubtask[],
  path: string[],
  patch: TaskPatch,
): TaskSubtask[] {
  const [head, ...tail] = path;
  const subPatch = subtaskPatchFromTaskPatch(patch);

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

export function subtaskPatchFromTaskPatch(patch: TaskPatch): Partial<TaskSubtask> {
  const out: Partial<TaskSubtask> = {};
  if (patch.title !== undefined) out.title = patch.title;
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.priority !== undefined) out.priority = patch.priority;
  if (patch.deadline !== undefined) out.deadline = patch.deadline;
  if (patch.assigneeId !== undefined) out.assigneeId = patch.assigneeId;
  if (patch.description !== undefined) out.description = patch.description;
  if (patch.checkItems !== undefined) out.checkItems = patch.checkItems;
  return out;
}

export function isSubtaskDone(subtask: TaskSubtask): boolean {
  return subtask.status === 'done';
}
