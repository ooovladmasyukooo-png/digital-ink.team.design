import { STATUS_META } from './constants';
import { designBriefForActiveList } from './designBriefCompletion';
import { sortDesignBriefs, type DesignBriefSortField } from './designBriefSort';
import type { Status, DesignBrief } from './types';

export const TASK_STATUS_TAB_ORDER: Status[] = ['new', 'ready', 'in_design', 'approve', 'done'];

export type StatusTaskGroup = {
  status: Status;
  label: string;
  tasks: DesignBrief[];
};

export function buildStatusTabGroups(
  briefs: DesignBrief[],
  matches: (brief: DesignBrief) => boolean,
  sort: DesignBriefSortField = 'priority',
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
      tasks: sortDesignBriefs(raw, sort).map(designBriefForActiveList),
    };
  });
}
