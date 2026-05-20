import { completionNowIso, normalizeCompletedAtIso } from './taskCompletion';
import type { Task } from './types';

/** Найраніший запис у журналі або явне createdAt. */
export function resolveTaskCreatedAt(task: Pick<Task, 'createdAt' | 'activityLog'>): string {
  if (task.createdAt) return normalizeCompletedAtIso(task.createdAt);

  if (task.activityLog.length > 0) {
    let oldest = task.activityLog[0].at;
    for (const entry of task.activityLog) {
      if (entry.at < oldest) oldest = entry.at;
    }
    return normalizeCompletedAtIso(oldest);
  }

  return completionNowIso();
}
