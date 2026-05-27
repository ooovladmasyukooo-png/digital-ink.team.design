import { PRIORITIES, STATUS_META } from './constants';
import type { DesignBrief, DesignBriefViewTabId, Priority } from './types';

export type DesignBriefSortField = 'deadline' | 'status' | 'priority';

export const DESIGN_BRIEF_SORT_BY_TAB_STORAGE_KEY = 'design-brief-sort-by-tab';

export const DESIGN_BRIEF_SORT_OPTIONS: DesignBriefSortField[] = ['deadline', 'status', 'priority'];

export const DESIGN_BRIEF_SORT_LABELS: Record<DesignBriefSortField, string> = {
  deadline: 'За дедлайном',
  status: 'За статусом',
  priority: 'За пріоритетом',
};

export const DESIGN_BRIEF_SORT_SHORT: Record<DesignBriefSortField, string> = {
  deadline: 'Дедлайн',
  status: 'Статус',
  priority: 'Пріоритет',
};

export const TAB_DEFAULT_SORT: Record<DesignBriefViewTabId, DesignBriefSortField> = {
  'by-date': 'priority',
  'by-status': 'status',
  'by-people': 'priority',
  archive: 'deadline',
};

const NO_PRIORITY_RANK = 99;

function deadlineSortKey(iso: string | null): number {
  if (!iso) return Number.MAX_SAFE_INTEGER;
  const datePart = iso.split('T')[0];
  const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    return Number.MAX_SAFE_INTEGER;
  }
  const hasTime = iso.includes('T');
  const time = hasTime ? new Date(iso).getTime() : dt.getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function priorityRank(priority: Priority | null): number {
  if (!priority) return NO_PRIORITY_RANK;
  return PRIORITIES[priority].rank;
}

type BriefSortable = {
  status: DesignBrief['status'];
  priority: DesignBrief['priority'];
  deadline: DesignBrief['deadline'];
  sortKey: string;
};

function briefSortableFromBrief(
  brief: Pick<DesignBrief, 'id' | 'status' | 'priority' | 'deadline'>,
): BriefSortable {
  return { status: brief.status, priority: brief.priority, deadline: brief.deadline, sortKey: brief.id };
}

export function compareDesignBriefsBySort(
  a: BriefSortable,
  b: BriefSortable,
  sort: DesignBriefSortField,
): number {
  switch (sort) {
    case 'deadline': {
      const diff = deadlineSortKey(a.deadline) - deadlineSortKey(b.deadline);
      if (diff !== 0) return diff;
      break;
    }
    case 'status': {
      const diff = STATUS_META[a.status].rank - STATUS_META[b.status].rank;
      if (diff !== 0) return diff;
      break;
    }
    case 'priority': {
      const diff = priorityRank(a.priority) - priorityRank(b.priority);
      if (diff !== 0) return diff;
      break;
    }
  }
  return a.sortKey.localeCompare(b.sortKey);
}

export function sortDesignBriefs<T extends DesignBrief>(briefs: T[], sort: DesignBriefSortField): T[] {
  return [...briefs].sort((a, b) =>
    compareDesignBriefsBySort(briefSortableFromBrief(a), briefSortableFromBrief(b), sort),
  );
}

export function getDefaultSortForTab(tab: DesignBriefViewTabId): DesignBriefSortField {
  return TAB_DEFAULT_SORT[tab];
}

function readSortByTabMap(): Partial<Record<DesignBriefViewTabId, DesignBriefSortField>> {
  try {
    const raw = sessionStorage.getItem(DESIGN_BRIEF_SORT_BY_TAB_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<DesignBriefViewTabId, DesignBriefSortField>>;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Partial<Record<DesignBriefViewTabId, DesignBriefSortField>> = {};
    for (const tab of Object.keys(TAB_DEFAULT_SORT) as DesignBriefViewTabId[]) {
      const v = parsed[tab];
      if (v && DESIGN_BRIEF_SORT_OPTIONS.includes(v)) out[tab] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function readDesignBriefSortForTab(tab: DesignBriefViewTabId): DesignBriefSortField {
  const map = readSortByTabMap();
  return map[tab] ?? getDefaultSortForTab(tab);
}

export function writeDesignBriefSortForTab(tab: DesignBriefViewTabId, sort: DesignBriefSortField): void {
  try {
    const map = readSortByTabMap();
    map[tab] = sort;
    sessionStorage.setItem(DESIGN_BRIEF_SORT_BY_TAB_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
