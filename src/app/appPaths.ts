import type { FeatureId } from '../shared/types/common';
import type { ProjectSubtabId } from '../features/projects/types';
import type { TeamSubtabId } from '../features/team/types';

export const FEATURE_IDS: FeatureId[] = [
  'dashboard',
  'crm',
  'projects2',
  'analytics',
  'finance',
  'team',
  'tasks',
  'design-brief',
];

const TEAM_SUBTAB_IDS: TeamSubtabId[] = ['profile', 'tasks', 'payouts', 'effectiveness', 'settings'];
const PROJECT_SUBTAB_IDS: ProjectSubtabId[] = ['profile', 'payouts', 'effectiveness', 'settings'];

/** Непрофільні підвкладки в pathname (англійські сегменти). */
const TEAM_PATH_SUBTAB_IDS: Exclude<TeamSubtabId, 'profile'>[] = ['tasks', 'payouts', 'effectiveness', 'settings'];
const PROJECT_PATH_SUBTAB_IDS: Exclude<ProjectSubtabId, 'profile'>[] = ['payouts', 'effectiveness', 'settings'];

export function parseTeamSubtab(raw: string | null): TeamSubtabId {
  const t = raw?.trim().toLowerCase();
  if (t && TEAM_SUBTAB_IDS.includes(t as TeamSubtabId)) return t as TeamSubtabId;
  return 'profile';
}

export function parseProjectSubtab(raw: string | null): ProjectSubtabId {
  const t = raw?.trim().toLowerCase();
  if (t && PROJECT_SUBTAB_IDS.includes(t as ProjectSubtabId)) return t as ProjectSubtabId;
  return 'profile';
}

export function pathForFeature(feature: FeatureId): string {
  if (feature === 'projects2') return '/projects';
  if (feature === 'tasks') return '/tasks?day';
  if (feature === 'design-brief') return '/design-brief';
  return `/${feature}`;
}

export type ParsedLocation = {
  feature: FeatureId;
  teamProfileId: string | null;
  teamSubtab: TeamSubtabId;
  project2ProfileId: string | null;
  project2Subtab: ProjectSubtabId;
};

type ProfileFeature = 'team' | 'projects2';

function parseProfileFeature(
  feature: ProfileFeature,
  parts: string[],
  params: URLSearchParams,
): Pick<ParsedLocation, 'feature' | 'teamProfileId' | 'teamSubtab' | 'project2ProfileId' | 'project2Subtab'> {
  const pathSubtabs = feature === 'team' ? TEAM_PATH_SUBTAB_IDS : PROJECT_PATH_SUBTAB_IDS;
  const parseSubtab = feature === 'team' ? parseTeamSubtab : parseProjectSubtab;
  const seg2 = parts[1]?.toLowerCase();

  const empty: ParsedLocation = {
    feature,
    teamProfileId: null,
    teamSubtab: 'profile',
    project2ProfileId: null,
    project2Subtab: 'profile',
  };

  if (seg2 === 'profil' || seg2 === 'profile') {
    const raw = params.get('id');
    const id = raw?.trim() ? raw.trim() : null;
    const subtab = id ? parseSubtab(params.get('tab')) : 'profile';
    if (feature === 'team') {
      return { ...empty, teamProfileId: id, teamSubtab: subtab as TeamSubtabId };
    }
    return { ...empty, project2ProfileId: id, project2Subtab: subtab as ProjectSubtabId };
  }

  if (seg2 && pathSubtabs.includes(seg2 as (typeof pathSubtabs)[number])) {
    const raw = params.get('id');
    const id = raw?.trim() ? raw.trim() : null;
    if (feature === 'team') {
      return { ...empty, teamProfileId: id, teamSubtab: seg2 as TeamSubtabId };
    }
    return { ...empty, project2ProfileId: id, project2Subtab: seg2 as ProjectSubtabId };
  }

  return empty;
}

/**
 * Team list: `/team`
 * Projects: `/projects` (projects2 feature)
 */
export function parseLocation(pathname: string, search: string): ParsedLocation {
  const path = pathname.replace(/\/$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(search);

  if (parts[0] === 'team') {
    return parseProfileFeature('team', parts, params);
  }

  if (parts[0] === 'projects' || parts[0] === 'projects2') {
    return parseProfileFeature('projects2', parts, params);
  }

  const seg = parts[0];
  if (seg && FEATURE_IDS.includes(seg as FeatureId)) {
    return {
      feature: seg as FeatureId,
      teamProfileId: null,
      teamSubtab: 'profile',
      project2ProfileId: null,
      project2Subtab: 'profile',
    };
  }

  return {
    feature: 'dashboard',
    teamProfileId: null,
    teamSubtab: 'profile',
    project2ProfileId: null,
    project2Subtab: 'profile',
  };
}

export function pathForTeamProfile(memberId: string, tab: TeamSubtabId = 'profile'): string {
  const q = new URLSearchParams();
  q.set('id', memberId);
  if (tab === 'profile') {
    return `/team/profil?${q.toString()}`;
  }
  return `/team/${tab}?${q.toString()}`;
}

export function pathForProject2Profile(projectId: string, tab: ProjectSubtabId = 'profile'): string {
  const q = new URLSearchParams();
  q.set('id', projectId);
  if (tab === 'profile') {
    return `/projects/profil?${q.toString()}`;
  }
  return `/projects/${tab}?${q.toString()}`;
}
