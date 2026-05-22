import type { DateGroupId } from '../tasks/types';
import {
  DATE_GROUP_ORDER,
  defaultDeadlineForGroup,
  getTaskDateGroup,
} from '../tasks/dateGroups';
import { designBriefForActiveList, isCompletedStatus } from './designBriefCompletion';
import { passesDesignBriefViewerFilter } from './designBriefViewer';
import type { DesignBrief, Priority } from './types';

export { DATE_GROUP_ORDER, DATE_GROUP_LABELS } from '../tasks/dateGroups';

const DATE_GROUPS_BY_PRIORITY: DateGroupId[] = ['overdue', 'today', 'tomorrow'];

const PRIORITY_SORT_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const NO_PRIORITY_SORT_RANK = 99;

function compareByPriority(a: DesignBrief, b: DesignBrief): number {
  const rankA = a.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[a.priority];
  const rankB = b.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[b.priority];
  if (rankA !== rankB) return rankA - rankB;
  return a.id.localeCompare(b.id);
}

export function groupDesignBriefsByDate(
  briefs: DesignBrief[],
  now = new Date(),
  viewerId?: string,
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

  for (const groupId of DATE_GROUPS_BY_PRIORITY) {
    buckets[groupId].sort(compareByPriority);
  }

  for (const groupId of DATE_GROUP_ORDER) {
    buckets[groupId] = buckets[groupId].map(designBriefForActiveList);
  }

  return buckets;
}

export { defaultDeadlineForGroup };
