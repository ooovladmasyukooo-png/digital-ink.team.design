import { teamMembers } from '../team/data';
import {
  normalizeChurnRisk,
  PROJECT_CHURN_RISK_LEVELS,
} from './projectChurnRisk';
import {
  normalizePipelineStatus,
  pipelineStatusTone,
  PROJECT_PIPELINE_STATUS_OPTIONS,
  type ProjectPipelineStatus,
} from './projectPipelineStatus';
import type { Tone } from '../../shared/types/common';
import {
  normalizeTeamAssignments,
  memberIdForPosition,
  positionMeta,
  teamMemberIds,
} from './projectTeam';
import type { Project, ProjectTeamPositionId } from './types';

export type ProjectListLayout = 'cards' | 'crm';

/** Порядок карток у групі/колонці за critical score */
export type ProjectListChurnOrder = 'high-first' | 'low-first';

export const DEFAULT_PROJECT_LIST_CHURN_ORDER: ProjectListChurnOrder = 'high-first';

export const PROJECT_LIST_CHURN_ORDER_OPTIONS: {
  id: ProjectListChurnOrder;
  label: string;
  short: string;
}[] = [
  { id: 'high-first', label: 'Спочатку критичні', short: 'критичні ↓' },
  { id: 'low-first', label: 'Спочатку спокійні', short: 'спокійні ↑' },
];

export function churnOrderToolbarLabel(order: ProjectListChurnOrder): string {
  return PROJECT_LIST_CHURN_ORDER_OPTIONS.find((option) => option.id === order)?.short ?? 'критичні ↓';
}

export type ProjectListGroupBy =
  | 'status'
  | 'media_buyer'
  | 'pm'
  | 'team_lead'
  | 'direction';

export const PROJECT_LIST_GROUP_BY_OPTIONS: {
  id: ProjectListGroupBy;
  label: string;
}[] = [
  { id: 'status', label: 'Статус' },
  { id: 'media_buyer', label: 'Media Buyer' },
  { id: 'pm', label: 'PM' },
  { id: 'team_lead', label: 'Team Lead' },
  { id: 'direction', label: 'Напрям' },
];

export const PROJECT_LIST_POSITION_GROUP_OPTIONS = PROJECT_LIST_GROUP_BY_OPTIONS.filter(
  (option): option is { id: 'media_buyer' | 'pm' | 'team_lead'; label: string } =>
    option.id === 'media_buyer' || option.id === 'pm' || option.id === 'team_lead',
);

export const UNASSIGNED_GROUP_KEY = '__unassigned__';

/** Приховані в списку за замовчуванням; увімкніть у фільтрах «Статус» */
export const PIPELINE_STATUSES_HIDDEN_BY_DEFAULT: ProjectPipelineStatus[] = [
  'Draft',
  'Temporarily stopped',
  'Stopped working',
];

export type ProjectListFilters = {
  /** Pipeline-статуси, які приховати */
  hiddenPipelineStatuses: ProjectPipelineStatus[];
  /** Люди в команді проєкту (будь-яка роль) */
  memberIds: string[];
};

export const DEFAULT_PROJECT_LIST_FILTERS: ProjectListFilters = {
  hiddenPipelineStatuses: [...PIPELINE_STATUSES_HIDDEN_BY_DEFAULT],
  memberIds: [],
};

function hiddenPipelineSetsEqual(
  a: readonly ProjectPipelineStatus[],
  b: readonly ProjectPipelineStatus[],
): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((status) => setA.has(status));
}

export type ProjectListGroup = {
  key: string;
  label: string;
  memberId: string | null;
  pipelineStatus: ProjectPipelineStatus | null;
  projects: Project[];
};

const POSITION_GROUP_BY: Record<
  'media_buyer' | 'pm' | 'team_lead',
  { position: ProjectTeamPositionId; emptyLabel: string; filterTitle: string }
> = {
  media_buyer: { position: 'media_buyer', emptyLabel: 'Без Media Buyer', filterTitle: 'Media Buyer' },
  pm: { position: 'pm', emptyLabel: 'Без PM', filterTitle: 'PM' },
  team_lead: { position: 'team_lead', emptyLabel: 'Без співробітника', filterTitle: 'Team Lead' },
};

export function isPositionGroupBy(
  groupBy: ProjectListGroupBy,
): groupBy is 'media_buyer' | 'pm' | 'team_lead' {
  return groupBy === 'media_buyer' || groupBy === 'pm' || groupBy === 'team_lead';
}

function projectPipelineStatus(project: Project): ProjectPipelineStatus {
  return normalizePipelineStatus(project.pipelineStatus);
}

function matchesSearch(project: Project, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${project.name} ${project.username}`.toLowerCase().includes(q);
}

function passesPeopleFilter(project: Project, memberIds: string[]): boolean {
  if (memberIds.length === 0) return true;
  const onProject = teamMemberIds(normalizeTeamAssignments(project));
  return memberIds.some((id) => onProject.includes(id));
}

function passesMemberIdsFilter(
  project: Project,
  groupBy: ProjectListGroupBy,
  memberIds: string[],
): boolean {
  if (memberIds.length === 0) return true;
  if (isPositionGroupBy(groupBy)) {
    const spec = POSITION_GROUP_BY[groupBy];
    const assigned = memberIdForPosition(normalizeTeamAssignments(project), spec.position);
    if (!assigned) return false;
    return memberIds.includes(assigned);
  }
  return passesPeopleFilter(project, memberIds);
}

function applyListFilters(
  project: Project,
  filters: ProjectListFilters,
  groupBy: ProjectListGroupBy,
): boolean {
  const hiddenPipeline = new Set(filters.hiddenPipelineStatuses);

  if (hiddenPipeline.has(projectPipelineStatus(project))) return false;
  if (!passesMemberIdsFilter(project, groupBy, filters.memberIds)) return false;
  return true;
}

export function collectAllListMemberIds(projects: Project[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const project of projects) {
    for (const memberId of teamMemberIds(normalizeTeamAssignments(project))) {
      if (seen.has(memberId)) continue;
      seen.add(memberId);
      ids.push(memberId);
    }
  }
  const order = new Map(teamMembers.map((member, index) => [member.id, index]));
  return ids.sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999));
}

export function collectListDirections(projects: Project[]): string[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    counts.set(project.role, (counts.get(project.role) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'uk'))
    .map(([role]) => role);
}

export function collectListPositionMemberIds(
  projects: Project[],
  position: ProjectTeamPositionId,
): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const project of projects) {
    const memberId = memberIdForPosition(normalizeTeamAssignments(project), position);
    if (!memberId || seen.has(memberId)) continue;
    seen.add(memberId);
    ids.push(memberId);
  }
  const order = new Map(teamMembers.map((member, index) => [member.id, index]));
  return ids.sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999));
}

/** Kanban: усі колонки статусів; фільтр за напрямом / Media Buyer / PM / TL + пошук. */
export function filterProjectsForCrmBoard(
  projects: Project[],
  filters: ProjectListFilters,
  query: string,
  groupBy: ProjectListGroupBy,
): Project[] {
  return projects.filter(
    (project) => applyListFilters(project, filters, groupBy) && matchesSearch(project, query),
  );
}

export function filterProjects(
  projects: Project[],
  filters: ProjectListFilters,
  query: string,
  groupBy: ProjectListGroupBy,
): Project[] {
  return projects.filter(
    (project) => applyListFilters(project, filters, groupBy) && matchesSearch(project, query),
  );
}

function groupKeyForProject(project: Project, groupBy: ProjectListGroupBy): string {
  if (groupBy === 'status') return projectPipelineStatus(project);
  if (groupBy === 'direction') return project.role;

  const spec = POSITION_GROUP_BY[groupBy];
  const assignments = normalizeTeamAssignments(project);
  return memberIdForPosition(assignments, spec.position) ?? UNASSIGNED_GROUP_KEY;
}

function groupLabelForKey(
  key: string,
  groupBy: ProjectListGroupBy,
  memberNameById: Record<string, string>,
): { label: string; memberId: string | null; pipelineStatus: ProjectPipelineStatus | null } {
  if (groupBy === 'status') {
    const status = normalizePipelineStatus(key);
    return { label: status, memberId: null, pipelineStatus: status };
  }
  if (groupBy === 'direction') {
    return { label: key, memberId: null, pipelineStatus: null };
  }

  const spec = POSITION_GROUP_BY[groupBy];
  if (key === UNASSIGNED_GROUP_KEY) {
    return { label: spec.emptyLabel, memberId: null, pipelineStatus: null };
  }

  return { label: memberNameById[key] ?? key, memberId: key, pipelineStatus: null };
}

function orderedGroupKeys(
  keys: string[],
  groupBy: ProjectListGroupBy,
  directionOrder: string[],
): string[] {
  if (groupBy === 'status') {
    return PROJECT_PIPELINE_STATUS_OPTIONS.filter((status) => keys.includes(status));
  }
  if (groupBy === 'direction') {
    const seen = new Set(keys);
    const ordered = directionOrder.filter((role) => seen.has(role));
    for (const key of keys) {
      if (!ordered.includes(key)) ordered.push(key);
    }
    return ordered;
  }

  const memberOrder = teamMembers.map((member) => member.id);
  const people = keys.filter((key) => key !== UNASSIGNED_GROUP_KEY);
  const sorted = [
    ...memberOrder.filter((id) => people.includes(id)),
    ...people.filter((id) => !memberOrder.includes(id)).sort((a, b) => a.localeCompare(b, 'uk')),
  ];
  if (keys.includes(UNASSIGNED_GROUP_KEY)) sorted.push(UNASSIGNED_GROUP_KEY);
  return sorted;
}

function churnRiskSortIndex(project: Project): number {
  const level = normalizeChurnRisk(project.churnRisk);
  const index = PROJECT_CHURN_RISK_LEVELS.indexOf(level);
  return index >= 0 ? index : PROJECT_CHURN_RISK_LEVELS.indexOf('Medium');
}

export function sortProjectsForList(
  projects: Project[],
  churnOrder: ProjectListChurnOrder,
): Project[] {
  return [...projects].sort((a, b) => {
    const diff =
      churnOrder === 'high-first'
        ? churnRiskSortIndex(b) - churnRiskSortIndex(a)
        : churnRiskSortIndex(a) - churnRiskSortIndex(b);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, 'uk');
  });
}

export function buildProjectListGroups(
  projects: Project[],
  groupBy: ProjectListGroupBy,
  memberNameById: Record<string, string>,
  directionOrder: string[],
  churnOrder: ProjectListChurnOrder,
): ProjectListGroup[] {
  const buckets = new Map<string, Project[]>();

  for (const project of projects) {
    const key = groupKeyForProject(project, groupBy);
    const list = buckets.get(key) ?? [];
    list.push(project);
    buckets.set(key, list);
  }

  const keys = orderedGroupKeys([...buckets.keys()], groupBy, directionOrder);

  return keys.map((key) => {
    const { label, memberId, pipelineStatus } = groupLabelForKey(key, groupBy, memberNameById);
    const list = buckets.get(key) ?? [];
    return {
      key,
      label,
      memberId,
      pipelineStatus,
      projects: sortProjectsForList(list, churnOrder),
    };
  });
}

export function filterPanelTitle(groupBy: ProjectListGroupBy): string {
  if (groupBy === 'status') return 'Статус проєкту';
  if (groupBy === 'direction') return 'Напрям';
  if (isPositionGroupBy(groupBy)) return POSITION_GROUP_BY[groupBy].filterTitle;
  return 'Фільтри';
}

export function pipelineStatusFiltersDifferFromDefault(filters: ProjectListFilters): boolean {
  return !hiddenPipelineSetsEqual(
    filters.hiddenPipelineStatuses,
    PIPELINE_STATUSES_HIDDEN_BY_DEFAULT,
  );
}

export function activeFilterCount(filters: ProjectListFilters): number {
  let count = 0;
  if (pipelineStatusFiltersDifferFromDefault(filters)) count += 1;
  if (filters.memberIds.length > 0) count += 1;
  return count;
}

export function hasActiveFilters(filters: ProjectListFilters): boolean {
  return activeFilterCount(filters) > 0;
}

export function visiblePipelineStatuses(filters: ProjectListFilters): ProjectPipelineStatus[] {
  const hidden = new Set(filters.hiddenPipelineStatuses);
  return PROJECT_PIPELINE_STATUS_OPTIONS.filter((status) => !hidden.has(status));
}

export function projectsForPipelineStatus(
  projects: Project[],
  status: ProjectPipelineStatus,
): Project[] {
  return projects.filter((project) => projectPipelineStatus(project) === status);
}

export type CrmBoardColumn = {
  key: string;
  label: string;
  projects: Project[];
  memberId: string | null;
  pipelineStatus: ProjectPipelineStatus | null;
  tone: Tone;
  /** Drag між колонками змінює pipeline status */
  droppable: boolean;
};

export function buildCrmBoardColumns(
  projects: Project[],
  groupBy: ProjectListGroupBy,
  memberNameById: Record<string, string>,
  directionOrder: string[],
  churnOrder: ProjectListChurnOrder,
): CrmBoardColumn[] {
  if (groupBy === 'status') {
    return PROJECT_PIPELINE_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: status,
      projects: sortProjectsForList(projectsForPipelineStatus(projects, status), churnOrder),
      memberId: null,
      pipelineStatus: status,
      tone: pipelineStatusTone(status),
      droppable: true,
    }));
  }

  const groups = buildProjectListGroups(
    projects,
    groupBy,
    memberNameById,
    directionOrder,
    churnOrder,
  );
  return groups.map((group) => ({
    key: group.key,
    label: group.label,
    projects: group.projects,
    memberId: group.memberId,
    pipelineStatus: null,
    tone: 'gray',
    droppable: false,
  }));
}

const STORAGE_KEY = 'aurora:p2-list-view';

type StoredView = {
  groupBy?: ProjectListGroupBy;
  sortBy?: string;
  churnOrder?: ProjectListChurnOrder;
  layout?: ProjectListLayout;
  filters?: Partial<ProjectListFilters> & { hiddenStatuses?: string[] };
};

function parseStoredChurnOrder(parsed: StoredView): ProjectListChurnOrder {
  if (parsed.churnOrder === 'high-first' || parsed.churnOrder === 'low-first') {
    return parsed.churnOrder;
  }
  if (parsed.sortBy === 'low-first') return 'low-first';
  return 'high-first';
}

function parseStoredPipelineStatuses(raw: unknown): ProjectPipelineStatus[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (value): value is ProjectPipelineStatus =>
      typeof value === 'string' &&
      (PROJECT_PIPELINE_STATUS_OPTIONS as readonly string[]).includes(value),
  );
}

export function readProjectListView(): {
  groupBy: ProjectListGroupBy;
  churnOrder: ProjectListChurnOrder;
  filters: ProjectListFilters;
  layout: ProjectListLayout;
} {
  const fallback = {
    groupBy: 'status' as ProjectListGroupBy,
    churnOrder: 'high-first' as ProjectListChurnOrder,
    filters: { ...DEFAULT_PROJECT_LIST_FILTERS },
    layout: 'cards' as ProjectListLayout,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as StoredView;
    const storedGroupBy =
      parsed.groupBy === 'direction' ? 'status' : parsed.groupBy;
    const groupBy = PROJECT_LIST_GROUP_BY_OPTIONS.some((option) => option.id === storedGroupBy)
      ? (storedGroupBy as ProjectListGroupBy)
      : fallback.groupBy;
    const churnOrder = parseStoredChurnOrder(parsed);
    const layout: ProjectListLayout = parsed.layout === 'crm' ? 'crm' : 'cards';
    const filters = parsed.filters ?? {};
    const legacyHidden = Array.isArray(filters.hiddenStatuses) ? filters.hiddenStatuses : [];
    const legacyPipeline = legacyHidden
      .map((value) => {
        if (value === 'active') return 'Active' as ProjectPipelineStatus;
        if (value === 'paused') return 'Pause' as ProjectPipelineStatus;
        return null;
      })
      .filter((value): value is ProjectPipelineStatus => value !== null);

    const storedHidden = parseStoredPipelineStatuses(filters.hiddenPipelineStatuses);
    const hiddenPipelineStatuses =
      filters.hiddenPipelineStatuses !== undefined
        ? [...new Set([...storedHidden, ...legacyPipeline])]
        : [...PIPELINE_STATUSES_HIDDEN_BY_DEFAULT];

    return {
      groupBy,
      churnOrder,
      layout,
      filters: {
        hiddenPipelineStatuses,
        memberIds: Array.isArray(filters.memberIds)
          ? filters.memberIds.filter((s): s is string => typeof s === 'string')
          : [],
      },
    };
  } catch {
    return fallback;
  }
}

export function writeProjectListView(
  groupBy: ProjectListGroupBy,
  filters: ProjectListFilters,
  layout: ProjectListLayout,
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ groupBy, filters, layout }));
  } catch {
    /* ignore quota */
  }
}
