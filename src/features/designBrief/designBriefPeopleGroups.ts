import { teamMembers } from '../team/data';
import { designBriefForActiveList, isCompletedStatus } from './designBriefCompletion';
import { sortDesignBriefs, type DesignBriefSortField } from './designBriefSort';
import { isDesignBriefViewerAll, passesDesignBriefViewerFilter } from './designBriefViewer';
import type { DesignBrief } from './types';

export type DesignBriefPeopleGroup = {
  memberId: string;
  label: string;
  tasks: DesignBrief[];
};

export function buildDesignBriefPeopleGroups(
  briefs: DesignBrief[],
  viewerId: string,
  sort: DesignBriefSortField = 'priority',
): DesignBriefPeopleGroup[] {
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
      tasks: sortDesignBriefs(raw, sort).map(designBriefForActiveList),
    });
  }

  return groups;
}
