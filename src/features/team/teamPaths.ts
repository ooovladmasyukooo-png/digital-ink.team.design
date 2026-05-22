import type { TeamSubtabId } from './types';

/** Ключі в URL: /team?profil&id=…, /team?tasks&id=… */
export type TeamViewQuery = 'profil' | 'tasks' | 'payouts' | 'effectiveness' | 'settings';

export const TEAM_VIEW_QUERIES: TeamViewQuery[] = [
  'profil',
  'tasks',
  'payouts',
  'effectiveness',
  'settings',
];

export const QUERY_TO_TEAM_SUBTAB: Record<TeamViewQuery, TeamSubtabId> = {
  profil: 'profile',
  tasks: 'tasks',
  payouts: 'payouts',
  effectiveness: 'effectiveness',
  settings: 'settings',
};

export const TEAM_SUBTAB_TO_QUERY: Record<TeamSubtabId, TeamViewQuery> = {
  profile: 'profil',
  tasks: 'tasks',
  payouts: 'payouts',
  effectiveness: 'effectiveness',
  settings: 'settings',
};

function decodeId(value: string): string {
  try {
    return decodeURIComponent(value.trim());
  } catch {
    return value.trim();
  }
}

export type ParsedTeamSearch = {
  subtab: TeamSubtabId;
  memberId: string | null;
};

export function parseTeamSearch(search: string): ParsedTeamSearch {
  if (!search || search === '?') {
    return { subtab: 'profile', memberId: null };
  }

  const raw = search.startsWith('?') ? search.slice(1) : search;
  let subtab: TeamSubtabId = 'profile';
  let memberId: string | null = null;

  for (const part of raw.split('&').filter(Boolean)) {
    const eq = part.indexOf('=');
    const key = (eq === -1 ? part : part.slice(0, eq)).trim().toLowerCase();
    const value = eq === -1 ? '' : part.slice(eq + 1);

    if ((TEAM_VIEW_QUERIES as string[]).includes(key)) {
      subtab = QUERY_TO_TEAM_SUBTAB[key as TeamViewQuery];
      continue;
    }
    if (key === 'id' && value.trim()) {
      memberId = decodeId(value);
    }
  }

  return { subtab: memberId ? subtab : 'profile', memberId };
}

export function pathForTeamProfile(memberId: string, tab: TeamSubtabId = 'profile'): string {
  const view = TEAM_SUBTAB_TO_QUERY[tab];
  return `/team?${view}&id=${encodeURIComponent(memberId)}`;
}
