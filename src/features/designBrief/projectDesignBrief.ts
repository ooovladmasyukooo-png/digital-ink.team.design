import {
  createNewDesignBrief,
  createNewDesignBriefForGroup,
  createNewDesignBriefForMember,
  createNewDesignBriefForStatus,
  DESIGN_BRIEF_CREATOR_ID,
  DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID,
} from './constants';
import { designBriefForActiveList } from './designBriefCompletion';
import { sortDesignBriefs, type DesignBriefSortField } from './designBriefSort';
import type { StatusTaskGroup } from './statusTaskGroups';
import type { DateGroupId } from '../tasks/types';
import type { DesignBrief, Status } from './types';

/** Статуси, які показуємо у вкладці «ТЗ дизайнеру» всередині проєкту. */
export const PROJECT_DESIGN_BRIEF_STATUS_ORDER = ['new', 'ready', 'approve', 'done'] as const;

export type ProjectDesignBriefStatus = (typeof PROJECT_DESIGN_BRIEF_STATUS_ORDER)[number];

export const PROJECT_DESIGN_BRIEF_STATUS_LABEL = {
  new: 'New',
  ready: 'Ready for design',
  approve: 'Design approved',
  done: 'Done',
} satisfies Record<ProjectDesignBriefStatus, string>;

export function buildProjectDesignBriefStatusGroups(
  briefs: DesignBrief[],
  sort: DesignBriefSortField = 'priority',
): StatusTaskGroup[] {
  const buckets = new Map<ProjectDesignBriefStatus, DesignBrief[]>();
  for (const status of PROJECT_DESIGN_BRIEF_STATUS_ORDER) {
    buckets.set(status, []);
  }

  for (const brief of briefs) {
    if (!(PROJECT_DESIGN_BRIEF_STATUS_ORDER as readonly Status[]).includes(brief.status)) continue;
    const list = buckets.get(brief.status as ProjectDesignBriefStatus)!;
    list.push(brief);
  }

  return PROJECT_DESIGN_BRIEF_STATUS_ORDER.map((status) => {
    const raw = buckets.get(status) ?? [];
    const label = PROJECT_DESIGN_BRIEF_STATUS_LABEL[status];
    return {
      status,
      label,
      tasks: sortDesignBriefs(raw, sort).map(designBriefForActiveList),
    };
  });
}

export function filterDesignBriefsForProject(briefs: DesignBrief[], projectId: string): DesignBrief[] {
  return briefs.filter((brief) => brief.projectId === projectId);
}

export function createDesignBriefForProject(
  projectId: string,
  id: string,
  creatorId = DESIGN_BRIEF_CREATOR_ID,
  assigneeId = DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID,
): DesignBrief {
  return createNewDesignBrief(id, assigneeId, creatorId, projectId);
}

export function createDesignBriefForProjectStatus(
  projectId: string,
  status: Status,
  id: string,
  creatorId = DESIGN_BRIEF_CREATOR_ID,
  assigneeId = DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID,
): DesignBrief {
  return {
    ...createNewDesignBriefForStatus(status, id, creatorId, assigneeId),
    projectId,
  };
}

export function createDesignBriefForProjectGroup(
  projectId: string,
  groupId: DateGroupId,
  id: string,
  now = new Date(),
  creatorId = DESIGN_BRIEF_CREATOR_ID,
  assigneeId = DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID,
): DesignBrief {
  return {
    ...createNewDesignBriefForGroup(groupId, id, now, assigneeId, creatorId),
    projectId,
  };
}

export function createDesignBriefForProjectMember(
  projectId: string,
  memberId: string,
  id: string,
  creatorId = DESIGN_BRIEF_CREATOR_ID,
): DesignBrief {
  return {
    ...createNewDesignBriefForMember(memberId, id, creatorId),
    projectId,
  };
}
