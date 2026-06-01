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

export function createTeamAssignmentId(memberId: string): string {
  return `ta-${memberId}-${Math.random().toString(36).slice(2, 8)}`;
}

type TeamSource = Pick<Project, 'teamAssignments'> & {
  mediaBuyerId?: string;
  pmId?: string;
  teamLeadId?: string;
};

export function normalizeTeamAssignments(source: TeamSource): ProjectTeamAssignment[] {
  if (source.teamAssignments?.length) {
    return source.teamAssignments.map((row) => ({
      id: row.id,
      memberId: row.memberId,
      positions: [...row.positions],
    }));
  }

  const legacy: { memberId: string; position: ProjectTeamPositionId }[] = [];
  if (source.mediaBuyerId) legacy.push({ memberId: source.mediaBuyerId, position: 'media_buyer' });
  if (source.pmId) legacy.push({ memberId: source.pmId, position: 'pm' });
  if (source.teamLeadId) legacy.push({ memberId: source.teamLeadId, position: 'team_lead' });

  const byMember = new Map<string, ProjectTeamPositionId[]>();
  for (const entry of legacy) {
    const current = byMember.get(entry.memberId) ?? [];
    if (!current.includes(entry.position)) current.push(entry.position);
    byMember.set(entry.memberId, current);
  }

  return [...byMember.entries()].map(([memberId, positions]) => ({
    id: createTeamAssignmentId(memberId),
    memberId,
    positions,
  }));
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
  const row = assignments.find((a) => a.memberId === memberId);
  if (!row?.positions.length) return [];
  return row.positions.map((id) => positionMeta(id).short);
}

export function memberTooltip(memberId: string, assignments: ProjectTeamAssignment[], name: string): string {
  const shorts = memberPositionLabels(memberId, assignments);
  if (shorts.length === 0) return name;
  return `${shorts.join(', ')} · ${name}`;
}

export function addTeamMember(
  assignments: ProjectTeamAssignment[],
  memberId: string,
): ProjectTeamAssignment[] {
  if (assignments.some((row) => row.memberId === memberId)) return assignments;
  return [...assignments, { id: createTeamAssignmentId(memberId), memberId, positions: [] }];
}

export function removeTeamMember(
  assignments: ProjectTeamAssignment[],
  memberId: string,
): ProjectTeamAssignment[] {
  return assignments.filter((row) => row.memberId !== memberId);
}

export function toggleMemberPosition(
  assignments: ProjectTeamAssignment[],
  memberId: string,
  positionId: ProjectTeamPositionId,
): ProjectTeamAssignment[] {
  return assignments.map((row) => {
    if (row.memberId !== memberId) return row;
    const has = row.positions.includes(positionId);
    return {
      ...row,
      positions: has
        ? row.positions.filter((id) => id !== positionId)
        : [...row.positions, positionId],
    };
  });
}

export const DEFAULT_TEAM_ASSIGNMENTS: ProjectTeamAssignment[] = [
  { id: 'ta-daria', memberId: 'daria', positions: ['media_buyer'] },
  { id: 'ta-sofia', memberId: 'sofia', positions: ['pm'] },
  { id: 'ta-mira', memberId: 'mira', positions: ['team_lead'] },
];
