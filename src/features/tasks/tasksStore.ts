import { initialTasks } from './data';
import type { Task } from './types';

let tasksState: Task[] = initialTasks;
let nextTaskId = 100;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getTasks(): Task[] {
  return tasksState;
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
