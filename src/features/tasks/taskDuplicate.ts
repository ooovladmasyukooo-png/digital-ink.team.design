import { getSubtaskAtPath } from './subtaskTask';
import type { Task, TaskCheckItem, TaskComment, TaskSubtask } from './types';

function createIdFactory(prefix: string) {
  let counter = 0;
  return () => `${prefix}${Date.now()}_${counter++}`;
}

function cloneCheckItems(items: TaskCheckItem[], nextId: () => string): TaskCheckItem[] {
  return items.map((item) => ({ ...item, id: nextId() }));
}

function cloneSubtaskTree(subtask: TaskSubtask, nextId: () => string): TaskSubtask {
  return {
    ...subtask,
    id: nextId(),
    checkItems: cloneCheckItems(subtask.checkItems, nextId),
    subtasks: subtask.subtasks.map((child) => cloneSubtaskTree(child, nextId)),
  };
}

export function cloneTask(task: Task, newId: string, now = new Date()): Task {
  const nextId = createIdFactory('s');

  return {
    ...task,
    id: newId,
    createdAt: now.toISOString(),
    completedAt: null,
    status: task.status === 'done' || task.status === 'archive' ? 'new' : task.status,
    activityLog: [],
    comments: task.comments.map(
      (comment): TaskComment => ({
        ...comment,
        id: nextId(),
      }),
    ),
    checkItems: cloneCheckItems(task.checkItems, nextId),
    subtasks: task.subtasks.map((subtask) => cloneSubtaskTree(subtask, nextId)),
  };
}

export function cloneSubtask(subtask: TaskSubtask): TaskSubtask {
  const nextId = createIdFactory('s');
  return cloneSubtaskTree(subtask, nextId);
}

export function insertSubtaskAfterPath(
  subtasks: TaskSubtask[],
  path: string[],
  clone: TaskSubtask,
): TaskSubtask[] {
  if (path.length === 0) return [...subtasks, clone];

  const [head, ...tail] = path;
  if (tail.length === 0) {
    const idx = subtasks.findIndex((subtask) => subtask.id === head);
    if (idx === -1) return subtasks;
    const next = [...subtasks];
    next.splice(idx + 1, 0, clone);
    return next;
  }

  return subtasks.map((subtask) =>
    subtask.id === head
      ? { ...subtask, subtasks: insertSubtaskAfterPath(subtask.subtasks, tail, clone) }
      : subtask,
  );
}

export function duplicateTaskTarget(tasks: Task[], targetId: string, newRootId: string): Task[] {
  const slashIdx = targetId.indexOf('/');
  if (slashIdx === -1) {
    const idx = tasks.findIndex((task) => task.id === targetId);
    if (idx === -1) return tasks;
    const copy = cloneTask(tasks[idx], newRootId);
    const next = [...tasks];
    next.splice(idx + 1, 0, copy);
    return next;
  }

  const rootId = targetId.slice(0, slashIdx);
  const path = targetId.slice(slashIdx + 1).split('/');

  return tasks.map((task) => {
    if (task.id !== rootId) return task;
    const source = getSubtaskAtPath(task, path);
    if (!source) return task;
    const copy = cloneSubtask(source);
    return {
      ...task,
      subtasks: insertSubtaskAfterPath(task.subtasks, path, copy),
    };
  });
}
