import { completionNowIso, normalizeCompletedAtIso } from './designBriefCompletion';
import type { DesignBrief } from './types';

export function resolveDesignBriefCreatedAt(
  brief: Pick<DesignBrief, 'createdAt' | 'activityLog'>,
): string {
  if (brief.createdAt) return normalizeCompletedAtIso(brief.createdAt);
  const oldest = brief.activityLog.at(-1)?.at;
  return oldest ? normalizeCompletedAtIso(oldest) : completionNowIso();
}
