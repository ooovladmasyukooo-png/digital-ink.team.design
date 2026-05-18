import type { FeatureId } from '../shared/types/common';
import type { TeamSubtabId } from '../features/team/types';

export const FEATURE_IDS: FeatureId[] = ['dashboard', 'crm', 'projects', 'analytics', 'finance', 'team', 'tasks'];

const TEAM_SUBTAB_IDS: TeamSubtabId[] = ['profile', 'payouts', 'effectiveness', 'settings'];

/** Непрофільні підвкладки в pathname (англійські сегменти). */
const TEAM_PATH_SUBTAB_IDS: Exclude<TeamSubtabId, 'profile'>[] = ['payouts', 'effectiveness', 'settings'];

export function parseTeamSubtab(raw: string | null): TeamSubtabId {
  const t = raw?.trim().toLowerCase();
  if (t && TEAM_SUBTAB_IDS.includes(t as TeamSubtabId)) return t as TeamSubtabId;
  return 'profile';
}

export function pathForFeature(feature: FeatureId): string {
  return `/${feature}`;
}

export type ParsedLocation = {
  feature: FeatureId;
  teamProfileId: string | null;
  teamSubtab: TeamSubtabId;
};

/**
 * Team list: `/team`
 * Профіль: `/team/profil?id=…` (або `/team/profile?id=…`)
 * Інші вкладки: `/team/payouts?id=…`, `/team/effectiveness?id=…`, `/team/settings?id=…`
 * Застаріло (читається): `/team/profil?id=…&tab=payouts`
 */
export function parseLocation(pathname: string, search: string): ParsedLocation {
  const path = pathname.replace(/\/$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(search);

  if (parts[0] === 'team') {
    const seg2 = parts[1]?.toLowerCase();

    if (seg2 === 'profil' || seg2 === 'profile') {
      const raw = params.get('id');
      const id = raw?.trim() ? raw.trim() : null;
      const teamSubtab = id ? parseTeamSubtab(params.get('tab')) : 'profile';
      return { feature: 'team', teamProfileId: id, teamSubtab };
    }

    if (seg2 && TEAM_PATH_SUBTAB_IDS.includes(seg2 as (typeof TEAM_PATH_SUBTAB_IDS)[number])) {
      const raw = params.get('id');
      const id = raw?.trim() ? raw.trim() : null;
      return {
        feature: 'team',
        teamProfileId: id,
        teamSubtab: seg2 as TeamSubtabId,
      };
    }

    return { feature: 'team', teamProfileId: null, teamSubtab: 'profile' };
  }

  const seg = parts[0];
  if (seg && FEATURE_IDS.includes(seg as FeatureId)) {
    return { feature: seg as FeatureId, teamProfileId: null, teamSubtab: 'profile' };
  }

  return { feature: 'dashboard', teamProfileId: null, teamSubtab: 'profile' };
}

export function pathForTeamProfile(memberId: string, tab: TeamSubtabId = 'profile'): string {
  const q = new URLSearchParams();
  q.set('id', memberId);
  if (tab === 'profile') {
    return `/team/profil?${q.toString()}`;
  }
  return `/team/${tab}?${q.toString()}`;
}
