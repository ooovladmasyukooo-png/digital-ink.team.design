import { buildStatusTabGroups } from './statusTaskGroups';
import { isDesignBriefViewerAll, passesDesignBriefViewerFilter } from './designBriefViewer';
import type { DesignBrief } from './types';

export { TASK_STATUS_TAB_ORDER as DESIGN_BRIEF_STATUS_ORDER } from './statusTaskGroups';
export type { StatusTaskGroup as DesignBriefStatusGroup } from './statusTaskGroups';

export function buildDesignBriefGroups(briefs: DesignBrief[], viewerId: string) {
  const match = isDesignBriefViewerAll(viewerId)
    ? () => true
    : (brief: DesignBrief) => passesDesignBriefViewerFilter(brief, viewerId);
  return buildStatusTabGroups(briefs, match);
}
