import type { Project, ProjectTeamAssignment, ProjectTeamPositionId } from './types';

export const PROJECT_TEAM_POSITIONS: {
  id: ProjectTeamPositionId;
  label: string;
  short: string;
}[] = [
  { id: 'media_buyer', label: 'Media Buyer', short: 'MB' },
  { id: 'pm', label: 'PM', short: 'PM' },
  { id: 'team_lead', label: 'Team Lead', short: 'TL' },
  { id: 'designer', label: 'Designer', short: 'DS' },
  { id: 'booking', label: 'Booking', short: 'BK' },
  { id: 'strategist', label: 'Strategist', short: 'ST' },
  { id: 'analyst', label: 'Analyst', short: 'AN' },
];

const POSITION_BY_ID = Object.fromEntries(
  PROJECT_TEAM_POSITIONS.map((position) => [position.id, position]),
) as Record<ProjectTeamPositionId, (typeof PROJECT_TEAM_POSITIONS)[number]>;

export function positionMeta(positionId: ProjectTeamPositionId) {
  return POSITION_BY_ID[positionId];
}

export function createTeamAssignmentId(memberId: string, position: ProjectTeamPositionId): string {
  return `ta-${memberId}-${position}-${Math.random().toString(36).slice(2, 8)}`;
}

type TeamSource = Pick<Project, 'teamAssignments'> & {
  mediaBuyerId?: string;
  pmId?: string;
  teamLeadId?: string;
};

type LegacyTeamRow = {
  id: string;
  memberId: string;
  positions?: ProjectTeamPositionId[];
  position?: ProjectTeamPositionId;
};

function flattenTeamRow(row: LegacyTeamRow): ProjectTeamAssignment[] {
  if (row.position) {
    return [{ id: row.id, memberId: row.memberId, position: row.position }];
  }
  const positions = row.positions ?? [];
  if (positions.length === 0) return [];
  return positions.map((position) => ({
    id: positions.length === 1 ? row.id : createTeamAssignmentId(row.memberId, position),
    memberId: row.memberId,
    position,
  }));
}

export function normalizeTeamAssignments(source: TeamSource): ProjectTeamAssignment[] {
  if (source.teamAssignments?.length) {
    return source.teamAssignments.flatMap((row) => flattenTeamRow(row as LegacyTeamRow));
  }

  const legacy: { memberId: string; position: ProjectTeamPositionId }[] = [];
  if (source.mediaBuyerId) legacy.push({ memberId: source.mediaBuyerId, position: 'media_buyer' });
  if (source.pmId) legacy.push({ memberId: source.pmId, position: 'pm' });
  if (source.teamLeadId) legacy.push({ memberId: source.teamLeadId, position: 'team_lead' });

  return legacy.map((entry) => ({
    id: createTeamAssignmentId(entry.memberId, entry.position),
    memberId: entry.memberId,
    position: entry.position,
  }));
}

export function memberIdForPosition(
  assignments: ProjectTeamAssignment[],
  positionId: ProjectTeamPositionId,
): string | null {
  const row = assignments.find((assignment) => assignment.position === positionId);
  return row?.memberId ?? null;
}

export function teamMemberIds(assignments: ProjectTeamAssignment[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const row of assignments) {
    if (seen.has(row.memberId)) continue;
    seen.add(row.memberId);
    ids.push(row.memberId);
  }
  return ids;
}

export function memberPositionLabels(
  memberId: string,
  assignments: ProjectTeamAssignment[],
): string[] {
  return assignments
    .filter((row) => row.memberId === memberId)
    .map((row) => positionMeta(row.position).short);
}

export function memberTooltip(memberId: string, assignments: ProjectTeamAssignment[], name: string): string {
  const shorts = memberPositionLabels(memberId, assignments);
  if (shorts.length === 0) return name;
  return `${shorts.join(', ')} · ${name}`;
}

export function accessTooltip(row: ProjectTeamAssignment, name: string): string {
  return `${positionMeta(row.position).short} · ${name}`;
}

export function isTeamAccessTaken(
  assignments: ProjectTeamAssignment[],
  memberId: string,
  position: ProjectTeamPositionId,
  exceptAccessId?: string,
): boolean {
  return assignments.some(
    (row) =>
      row.memberId === memberId && row.position === position && row.id !== exceptAccessId,
  );
}

export function hasTeamAccess(
  assignments: ProjectTeamAssignment[],
  memberId: string,
  position: ProjectTeamPositionId,
): boolean {
  return isTeamAccessTaken(assignments, memberId, position);
}

export function addTeamAccess(
  assignments: ProjectTeamAssignment[],
  memberId: string,
  position: ProjectTeamPositionId,
): ProjectTeamAssignment[] {
  if (hasTeamAccess(assignments, memberId, position)) return assignments;
  return [
    ...assignments,
    { id: createTeamAssignmentId(memberId, position), memberId, position },
  ];
}

export function removeTeamAccess(
  assignments: ProjectTeamAssignment[],
  accessId: string,
): ProjectTeamAssignment[] {
  return assignments.filter((row) => row.id !== accessId);
}

export function updateTeamAccessPosition(
  assignments: ProjectTeamAssignment[],
  accessId: string,
  position: ProjectTeamPositionId,
): ProjectTeamAssignment[] {
  const row = assignments.find((item) => item.id === accessId);
  if (!row || row.position === position) return assignments;

  const withoutMemberPositionDupes = assignments.filter(
    (item) =>
      !(item.memberId === row.memberId && item.position === position && item.id !== accessId),
  );

  return withoutMemberPositionDupes.map((item) =>
    item.id === accessId ? { ...item, position } : item,
  );
}

export function reorderTeamAccess(
  assignments: ProjectTeamAssignment[],
  fromIndex: number,
  toIndex: number,
): ProjectTeamAssignment[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return assignments;
  if (fromIndex >= assignments.length || toIndex >= assignments.length) return assignments;
  const next = [...assignments];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export const DEFAULT_TEAM_ASSIGNMENTS: ProjectTeamAssignment[] = [
  { id: 'ta-daria-mb', memberId: 'daria', position: 'media_buyer' },
  { id: 'ta-sofia-pm', memberId: 'sofia', position: 'pm' },
  { id: 'ta-mira-tl', memberId: 'mira', position: 'team_lead' },
];
