import { DESIGN_BRIEF_CREATOR_ID } from './constants';
import type { DesignBrief } from './types';

export const DESIGN_BRIEF_VIEWER_ALL_ID = '__all__';

export function isDesignBriefViewerSelf(viewerId: string): boolean {
  return viewerId === DESIGN_BRIEF_CREATOR_ID;
}

export function isDesignBriefViewerAll(viewerId: string): boolean {
  return viewerId === DESIGN_BRIEF_VIEWER_ALL_ID;
}

export function passesDesignBriefViewerFilter(brief: DesignBrief, viewerId: string): boolean {
  if (isDesignBriefViewerAll(viewerId)) return true;
  return brief.creatorId === viewerId || brief.assigneeIds.includes(viewerId);
}
