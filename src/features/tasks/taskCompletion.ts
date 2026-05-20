import { treeRowKey } from './taskTree';
import type { ArchiveListItem, Status, Task, TaskPatch, TaskSubtask } from './types';

export function isCompletedStatus(status: Status): boolean {
  return status === 'done' || status === 'archive';
}

export function todayIsoDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function completionNowIso(now = new Date()): string {
  return now.toISOString();
}

export function completionPatchForStatus(
  prevStatus: Status,
  nextStatus: Status,
  prevCompletedAt: string | null,
  now = new Date(),
): { completedAt?: string | null } {
  if (nextStatus === prevStatus) return {};
  if (isCompletedStatus(nextStatus)) {
    return { completedAt: prevCompletedAt ?? completionNowIso(now) };
  }
  if (isCompletedStatus(prevStatus) && !isCompletedStatus(nextStatus)) {
    return { completedAt: null };
  }
  return {};
}

export function mergeTaskPatchWithCompletion(task: Task, patch: TaskPatch): TaskPatch {
  if (patch.status === undefined) return patch;
  return { ...patch, ...completionPatchForStatus(task.status, patch.status, task.completedAt) };
}

export function mergeSubtaskPatchWithCompletion(
  subtask: TaskSubtask,
  patch: TaskPatch,
): TaskPatch {
  if (patch.status === undefined) return patch;
  return { ...patch, ...completionPatchForStatus(subtask.status, patch.status, subtask.completedAt) };
}

/** Нормалізує до ISO datetime (для сортування й відображення часу). */
export function normalizeCompletedAtIso(value: string | null, now = new Date()): string {
  if (!value) return completionNowIso(now);
  if (value.includes('T')) return value;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return completionNowIso(now);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mo - 1, d, 12, 0, 0, 0).toISOString();
}

export function resolveCompletedAt(
  status: Status,
  completedAt: string | null,
  now = new Date(),
): string {
  if (completedAt) return normalizeCompletedAtIso(completedAt, now);
  if (isCompletedStatus(status)) return completionNowIso(now);
  return completionNowIso(now);
}

export function filterActiveSubtasks(subtasks: TaskSubtask[]): TaskSubtask[] {
  return subtasks
    .filter((s) => !isCompletedStatus(s.status))
    .map((s) => ({ ...s, subtasks: filterActiveSubtasks(s.subtasks) }));
}

export function taskForActiveList(task: Task): Task {
  if (isCompletedStatus(task.status)) {
    return { ...task, subtasks: [] };
  }
  return { ...task, subtasks: filterActiveSubtasks(task.subtasks) };
}

function walkSubtasks(
  items: ArchiveListItem[],
  root: Task,
  subtasks: TaskSubtask[],
  path: string[],
  parentTitle: string | null,
  rootProjectId: string | null,
): void {
  for (const subtask of subtasks) {
    if (isCompletedStatus(subtask.status)) {
      const subtaskPath = [...path, subtask.id];
      items.push({
        rowKey: treeRowKey(root.id, subtaskPath),
        rootTaskId: root.id,
        subtaskPath,
        isSubtask: true,
        parentTitle: parentTitle ?? root.title,
        rootTitle: root.title,
        title: subtask.title,
        description: subtask.description,
        status: subtask.status,
        priority: subtask.priority,
        deadline: subtask.deadline,
        completedAt: resolveCompletedAt(subtask.status, subtask.completedAt),
        assigneeIds: subtask.assigneeIds,
        creatorId: root.creatorId,
        projectId: subtask.projectId ?? rootProjectId,
      });
    }
    walkSubtasks(items, root, subtask.subtasks, [...path, subtask.id], subtask.title, rootProjectId);
  }
}

/** Усі завершені задачі та підзадачі (плоский список для архіву). */
export function collectArchiveItems(tasks: Task[]): ArchiveListItem[] {
  const items: ArchiveListItem[] = [];

  for (const task of tasks) {
    if (isCompletedStatus(task.status)) {
      items.push({
        rowKey: task.id,
        rootTaskId: task.id,
        subtaskPath: [],
        isSubtask: false,
        parentTitle: null,
        rootTitle: task.title,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        completedAt: resolveCompletedAt(task.status, task.completedAt),
        assigneeIds: task.assigneeIds,
        creatorId: task.creatorId,
        projectId: task.projectId,
      });
    }
    walkSubtasks(items, task, task.subtasks, [], null, task.projectId);
  }

  return items;
}
