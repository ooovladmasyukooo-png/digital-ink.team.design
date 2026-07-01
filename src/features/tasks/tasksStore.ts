import { initialTasks } from './data';
import { normalizeCustomTags, normalizeTaskTagIds } from './taskTags';
import type { Task, TaskSubtask, TaskTagId } from './types';

type TaskSeed = Omit<Task, 'tagIds' | 'customTags' | 'subtasks' | 'published' | 'sprintId'> & {
  tagIds?: TaskTagId[];
  customTags?: string[];
  published?: boolean;
  sprintId?: string | null;
  subtasks: TaskSubtaskSeed[];
};

type TaskSubtaskSeed = Omit<TaskSubtask, 'tagIds' | 'customTags' | 'subtasks'> & {
  tagIds?: TaskTagId[];
  customTags?: string[];
  subtasks: TaskSubtaskSeed[];
};

function hydrateSubtask(subtask: TaskSubtaskSeed): TaskSubtask {
  return {
    ...subtask,
    tagIds: normalizeTaskTagIds(subtask.tagIds),
    customTags: normalizeCustomTags(subtask.customTags),
    subtasks: subtask.subtasks.map(hydrateSubtask),
  };
}

function hydrateTask(task: TaskSeed): Task {
  return {
    ...task,
    published: task.published ?? false,
    sprintId: task.sprintId ?? null,
    tagIds: normalizeTaskTagIds(task.tagIds),
    customTags: normalizeCustomTags(task.customTags),
    subtasks: task.subtasks.map(hydrateSubtask),
  };
}

let tasksState: Task[] = initialTasks.map(hydrateTask);
let nextTaskId = 100;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getTasks(): Task[] {
  return tasksState;
}

export function getTaskById(id: string): Task | null {
  return tasksState.find((task) => task.id === id) ?? null;
}

export function setTasks(updater: Task[] | ((prev: Task[]) => Task[])): void {
  tasksState = typeof updater === 'function' ? updater(tasksState) : updater;
  emit();
}

export function allocateTaskId(): string {
  return `t${nextTaskId++}`;
}

export function subscribeTasks(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
