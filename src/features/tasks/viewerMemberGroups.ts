import type { TeamMember } from '../team/types';

const VIEWER_ROLE_ORDER = [
  'Owner',
  'Head of Project Manager',
  'Senior Media Buyer',
  'Media Buyer',
  'Project Manager',
  'Booking Manager',
] as const;

export type ViewerMemberGroup = { role: string; members: TeamMember[] };

const VIEWER_ROLE_LABELS: Record<string, string> = {
  Owner: 'Власник',
  'Head of Project Manager': 'Head of PM',
  'Senior Media Buyer': 'Senior buyer',
  'Media Buyer': 'Media buyer',
  'Project Manager': 'PM',
  'Booking Manager': 'Booking',
};

export function viewerRoleLabel(role: string): string {
  return VIEWER_ROLE_LABELS[role] ?? role;
}

export function groupViewerMembers(members: TeamMember[]): ViewerMemberGroup[] {
  const byRole = new Map<string, TeamMember[]>();

  for (const member of members) {
    const list = byRole.get(member.role) ?? [];
    list.push(member);
    byRole.set(member.role, list);
  }

  const roles = [...byRole.keys()].sort((a, b) => {
    const ia = VIEWER_ROLE_ORDER.indexOf(a as (typeof VIEWER_ROLE_ORDER)[number]);
    const ib = VIEWER_ROLE_ORDER.indexOf(b as (typeof VIEWER_ROLE_ORDER)[number]);
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'uk');
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return roles.map((role) => ({
    role,
    members: [...(byRole.get(role) ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'uk')),
  }));
}
