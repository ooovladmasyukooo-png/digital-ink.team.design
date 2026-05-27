import type { DateGroupId } from '../tasks/types';
import {
  DATE_GROUP_ORDER,
  defaultDeadlineForGroup,
  getTaskDateGroup,
} from '../tasks/dateGroups';
import { designBriefForActiveList, isCompletedStatus } from './designBriefCompletion';
import { sortDesignBriefs, type DesignBriefSortField } from './designBriefSort';
import { passesDesignBriefViewerFilter } from './designBriefViewer';
import type { DesignBrief } from './types';

export { DATE_GROUP_ORDER, DATE_GROUP_LABELS } from '../tasks/dateGroups';

export function groupDesignBriefsByDate(
  briefs: DesignBrief[],
  now = new Date(),
  viewerId?: string,
  sort: DesignBriefSortField = 'priority',
): Record<DateGroupId, DesignBrief[]> {
  const buckets = Object.fromEntries(DATE_GROUP_ORDER.map((id) => [id, [] as DesignBrief[]])) as Record<
    DateGroupId,
    DesignBrief[]
  >;

  for (const brief of briefs) {
    if (isCompletedStatus(brief.status)) continue;
    if (viewerId && !passesDesignBriefViewerFilter(brief, viewerId)) continue;
    const group = getTaskDateGroup(brief.deadline, now);
    buckets[group].push(brief);
  }

  for (const groupId of DATE_GROUP_ORDER) {
    buckets[groupId] = sortDesignBriefs(buckets[groupId], sort).map(designBriefForActiveList);
  }

  return buckets;
}

export { defaultDeadlineForGroup };
