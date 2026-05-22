import { PRIORITIES, STATUS_META } from './constants';
import { designBriefForActiveList } from './designBriefCompletion';
import type { Priority, Status, DesignBrief } from './types';

const PRIORITY_SORT_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const NO_PRIORITY_SORT_RANK = 99;

export const TASK_STATUS_TAB_ORDER: Status[] = ['new', 'ready', 'in_design', 'approve', 'done'];

export type StatusTaskGroup = {
  status: Status;
  label: string;
  tasks: DesignBrief[];
};

function compareByPriority(a: DesignBrief, b: DesignBrief): number {
  const rankA = a.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[a.priority];
  const rankB = b.priority === null ? NO_PRIORITY_SORT_RANK : PRIORITY_SORT_RANK[b.priority];
  if (rankA !== rankB) return rankA - rankB;
  return a.id.localeCompare(b.id);
}

export function buildStatusTabGroups(
  briefs: DesignBrief[],
  matches: (brief: DesignBrief) => boolean,
): StatusTaskGroup[] {
  const buckets = new Map<Status, DesignBrief[]>();
  for (const status of TASK_STATUS_TAB_ORDER) {
    buckets.set(status, []);
  }

  for (const brief of briefs) {
    if (!matches(brief)) continue;
    const list = buckets.get(brief.status);
    if (!list) continue;
    list.push(brief);
  }

  return TASK_STATUS_TAB_ORDER.map((status) => {
    const raw = buckets.get(status) ?? [];
    return {
      status,
      label: STATUS_META[status].label,
      tasks: [...raw].sort(compareByPriority).map(designBriefForActiveList),
    };
  });
}
