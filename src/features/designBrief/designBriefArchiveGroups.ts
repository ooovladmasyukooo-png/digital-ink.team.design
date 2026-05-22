import {
  ARCHIVE_GROUP_LABELS,
  ARCHIVE_GROUP_ORDER,
  getArchiveDateGroup,
} from '../tasks/archiveGroups';
import type { ArchiveGroupId } from '../tasks/types';
import { designBriefForActiveList, isCompletedStatus } from './designBriefCompletion';
import { isDesignBriefViewerAll, passesDesignBriefViewerFilter } from './designBriefViewer';
import type { DesignBrief } from './types';

export { ARCHIVE_GROUP_ORDER, ARCHIVE_GROUP_LABELS };

function completedAtTimestamp(iso: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function compareByCompletedDesc(a: DesignBrief, b: DesignBrief): number {
  const diff = completedAtTimestamp(b.completedAt) - completedAtTimestamp(a.completedAt);
  if (diff !== 0) return diff;
  return a.id.localeCompare(b.id);
}

export function groupDesignBriefArchive(
  briefs: DesignBrief[],
  now = new Date(),
  viewerId?: string,
): Record<ArchiveGroupId, DesignBrief[]> {
  const buckets = Object.fromEntries(ARCHIVE_GROUP_ORDER.map((id) => [id, [] as DesignBrief[]])) as Record<
    ArchiveGroupId,
    DesignBrief[]
  >;

  for (const brief of briefs) {
    if (!isCompletedStatus(brief.status)) continue;
    if (viewerId && !isDesignBriefViewerAll(viewerId) && !passesDesignBriefViewerFilter(brief, viewerId)) continue;
    const completedAt = brief.completedAt ?? brief.createdAt;
    const group = getArchiveDateGroup(completedAt, now);
    buckets[group].push(brief);
  }

  for (const groupId of ARCHIVE_GROUP_ORDER) {
    buckets[groupId] = buckets[groupId].sort(compareByCompletedDesc).map(designBriefForActiveList);
  }

  return buckets;
}
