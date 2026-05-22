import type { Status, DesignBrief, DesignBriefPatch, DesignBriefSubtask } from './types';

export function isCompletedStatus(status: Status): boolean {
  return status === 'closed';
}

export function completionNowIso(now = new Date()): string {
  return now.toISOString();
}

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

export function mergeDesignBriefPatchWithCompletion(
  brief: DesignBrief,
  patch: DesignBriefPatch,
): DesignBriefPatch {
  if (patch.status === undefined) return patch;
  return { ...patch, ...completionPatchForStatus(brief.status, patch.status, brief.completedAt) };
}

export function mergeSubtaskPatchWithCompletion(
  subtask: DesignBriefSubtask,
  patch: DesignBriefPatch,
): DesignBriefPatch {
  if (patch.status === undefined) return patch;
  return { ...patch, ...completionPatchForStatus(subtask.status, patch.status, subtask.completedAt) };
}

export function filterActiveSubtasks(subtasks: DesignBriefSubtask[]): DesignBriefSubtask[] {
  return subtasks
    .filter((s) => !isCompletedStatus(s.status))
    .map((s) => ({ ...s, subtasks: filterActiveSubtasks(s.subtasks) }));
}

export function designBriefForActiveList(brief: DesignBrief): DesignBrief {
  if (isCompletedStatus(brief.status)) {
    return { ...brief, subtasks: [] };
  }
  return { ...brief, subtasks: filterActiveSubtasks(brief.subtasks) };
}
