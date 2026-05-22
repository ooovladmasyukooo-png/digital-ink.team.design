import { teamMembers } from '../team/data';
import { PRIORITIES } from './constants';
import { designBriefForActiveList, isCompletedStatus } from './designBriefCompletion';
import { isDesignBriefViewerAll, passesDesignBriefViewerFilter } from './designBriefViewer';
import type { DesignBrief, Priority } from './types';

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

export type DesignBriefPeopleGroup = {
  memberId: string;
  label: string;
  tasks: DesignBrief[];
};

export function buildDesignBriefPeopleGroups(briefs: DesignBrief[], viewerId: string): DesignBriefPeopleGroup[] {
  const buckets = new Map<string, DesignBrief[]>();

  for (const brief of briefs) {
    if (isCompletedStatus(brief.status)) continue;
    if (!isDesignBriefViewerAll(viewerId) && !passesDesignBriefViewerFilter(brief, viewerId)) continue;
    for (const memberId of brief.assigneeIds) {
      const list = buckets.get(memberId) ?? [];
      if (!list.some((item) => item.id === brief.id)) list.push(brief);
      buckets.set(memberId, list);
    }
  }

  const orderedIds = [
    ...teamMembers.map((member) => member.id),
    ...[...buckets.keys()].filter((id) => !teamMembers.some((member) => member.id === id)),
  ];

  const seen = new Set<string>();
  const groups: DesignBriefPeopleGroup[] = [];

  for (const memberId of orderedIds) {
    if (seen.has(memberId)) continue;
    seen.add(memberId);
    const raw = buckets.get(memberId);
    if (!raw?.length) continue;
    const member = teamMembers.find((item) => item.id === memberId);
    groups.push({
      memberId,
      label: member?.name ?? memberId,
      tasks: [...raw].sort(compareByPriority).map(designBriefForActiveList),
    });
  }

  return groups;
}
