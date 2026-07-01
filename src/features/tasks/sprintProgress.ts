import { isCompletedStatus, taskForActiveList } from './taskCompletion';
import { sortTasks } from './taskSort';
import type { Task, TasksSortField } from './types';

export type SprintProgress = {
  done: number;
  total: number;
  percent: number;
};

/** Прогрес спринту — лише кореневі задачі (без підзадач). */
export function getSprintTaskProgress(tasks: Task[]): SprintProgress {
  const total = tasks.length;
  const done = tasks.filter((task) => isCompletedStatus(task.status)).length;

  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export function partitionSprintDrawerTasks(
  tasks: Task[],
  sort: TasksSortField = 'priority',
): { active: Task[]; completed: Task[] } {
  const activeRaw: Task[] = [];
  const completedRaw: Task[] = [];

  for (const task of tasks) {
    if (isCompletedStatus(task.status)) {
      completedRaw.push(task);
    } else {
      activeRaw.push(taskForActiveList(task));
    }
  }

  return {
    active: sortTasks(activeRaw, sort),
    completed: sortTasks(completedRaw, sort),
  };
}
