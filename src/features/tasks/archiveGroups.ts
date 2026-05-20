import type { ArchiveGroupId, ArchiveListItem } from './types';

export const ARCHIVE_GROUP_ORDER: ArchiveGroupId[] = ['today', 'yesterday', 'week', 'month', 'earlier'];

export const ARCHIVE_GROUP_LABELS: Record<ArchiveGroupId, string> = {
  today: 'Сьогодні',
  yesterday: 'Вчора',
  week: 'Цього тижня',
  month: 'Цього місяця',
  earlier: 'Раніше',
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseCompletedDay(iso: string): Date | null {
  if (iso.includes('T')) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return startOfDay(d);
  }
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return startOfDay(dt);
}

export function getArchiveDateGroup(completedAt: string, now = new Date()): ArchiveGroupId {
  const d = parseCompletedDay(completedAt);
  if (!d) return 'earlier';

  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const day = today.getDay();
  const mondayOffset = (day + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - mondayOffset);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  if (d.getTime() === today.getTime()) return 'today';
  if (d.getTime() === yesterday.getTime()) return 'yesterday';
  if (d >= weekStart) return 'week';
  if (d >= monthStart) return 'month';
  return 'earlier';
}

function completedAtTimestamp(iso: string): number {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

/** Від найновішого виконання до найстарішого. */
function compareByCompletedDesc(a: ArchiveListItem, b: ArchiveListItem): number {
  const diff = completedAtTimestamp(b.completedAt) - completedAtTimestamp(a.completedAt);
  if (diff !== 0) return diff;
  return a.rowKey.localeCompare(b.rowKey);
}

export function groupArchiveItems(
  items: ArchiveListItem[],
  now = new Date(),
): Record<ArchiveGroupId, ArchiveListItem[]> {
  const buckets = Object.fromEntries(ARCHIVE_GROUP_ORDER.map((id) => [id, [] as ArchiveListItem[]])) as Record<
    ArchiveGroupId,
    ArchiveListItem[]
  >;

  for (const item of items) {
    const group = getArchiveDateGroup(item.completedAt, now);
    buckets[group].push(item);
  }

  for (const groupId of ARCHIVE_GROUP_ORDER) {
    buckets[groupId].sort(compareByCompletedDesc);
  }

  return buckets;
}
