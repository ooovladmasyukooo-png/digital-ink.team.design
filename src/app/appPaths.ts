import type { FeatureId } from '../shared/types/common';
import type { ProjectSubtabId } from '../features/projects2/types';
import { parseProjectSearch, pathForProject2Profile } from '../features/projects2/project2Paths';
import type { TeamSubtabId } from '../features/team/types';
import { parseTeamSearch, pathForTeamProfile } from '../features/team/teamPaths';

export const FEATURE_IDS: FeatureId[] = [
  'dashboard',
  'crm',
  'projects2',
  'analytics',
  'tz-designer',
  'team',
  'tasks',
  'design-brief',
];

const TEAM_SUBTAB_IDS: TeamSubtabId[] = ['profile', 'tasks', 'payouts', 'effectiveness', 'settings'];
const PROJECT_SUBTAB_IDS: ProjectSubtabId[] = [
  'profile',
  'tasks',
  'documents',
  'daily-reports',
  'bookings',
  'design-brief',
];

/** Старі pathname-підвкладки: /team/tasks?id=… */
const TEAM_PATH_SUBTAB_IDS: Exclude<TeamSubtabId, 'profile'>[] = ['tasks', 'payouts', 'effectiveness', 'settings'];
const PROJECT_PATH_SUBTAB_IDS: Exclude<ProjectSubtabId, 'profile'>[] = [
  'tasks',
  'documents',
  'daily-reports',
  'bookings',
  'design-brief',
];

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
  if (feature === 'tz-designer') return '/tz-designer';
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

function parseLegacyProfileFeature(
  feature: ProfileFeature,
  parts: string[],
  search: string,
): Pick<ParsedLocation, 'feature' | 'teamProfileId' | 'teamSubtab' | 'project2ProfileId' | 'project2Subtab'> | null {
  const parseSubtab = feature === 'team' ? parseTeamSubtab : parseProjectSubtab;
  const seg2 = parts[1]?.toLowerCase();
  const params = new URLSearchParams(search);
  const rawId = params.get('id');
  const id = rawId?.trim() ? rawId.trim() : null;

  const empty: ParsedLocation = {
    feature,
    teamProfileId: null,
    teamSubtab: 'profile',
    project2ProfileId: null,
    project2Subtab: 'profile',
  };

  if (seg2 === 'profil' || seg2 === 'profile') {
    const subtab = id ? parseSubtab(params.get('tab')) : 'profile';
    if (feature === 'team') {
      return { ...empty, teamProfileId: id, teamSubtab: subtab as TeamSubtabId };
    }
    return { ...empty, project2ProfileId: id, project2Subtab: subtab as ProjectSubtabId };
  }

  if (feature === 'team') {
    if (seg2 && TEAM_PATH_SUBTAB_IDS.includes(seg2 as (typeof TEAM_PATH_SUBTAB_IDS)[number])) {
      return { ...empty, teamProfileId: id, teamSubtab: seg2 as TeamSubtabId };
    }
  } else if (seg2 && PROJECT_PATH_SUBTAB_IDS.includes(seg2 as (typeof PROJECT_PATH_SUBTAB_IDS)[number])) {
    return { ...empty, project2ProfileId: id, project2Subtab: seg2 as ProjectSubtabId };
  }

  return null;
}

function parseProfileFeature(
  feature: ProfileFeature,
  parts: string[],
  search: string,
): Pick<ParsedLocation, 'feature' | 'teamProfileId' | 'teamSubtab' | 'project2ProfileId' | 'project2Subtab'> {
  const empty: ParsedLocation = {
    feature,
    teamProfileId: null,
    teamSubtab: 'profile',
    project2ProfileId: null,
    project2Subtab: 'profile',
  };

  const legacy = parseLegacyProfileFeature(feature, parts, search);
  if (legacy) return legacy;

  if (parts.length !== 1) return empty;

  if (feature === 'team') {
    const parsed = parseTeamSearch(search);
    return {
      ...empty,
      teamProfileId: parsed.memberId,
      teamSubtab: parsed.subtab,
    };
  }

  const parsed = parseProjectSearch(search);
  return {
    ...empty,
    project2ProfileId: parsed.projectId,
    project2Subtab: parsed.subtab,
  };
}

/**
 * Team list: `/team`
 * Team profile: `/team?profil&id=…`
 * Team tasks: `/team?tasks&id=…`
 * Projects: `/projects?profil&id=…`
 */
export function parseLocation(pathname: string, search: string): ParsedLocation {
  const path = pathname.replace(/\/$/, '') || '/';
  const parts = path.split('/').filter(Boolean);

  if (parts[0] === 'team') {
    return parseProfileFeature('team', parts, search);
  }

  if (parts[0] === 'projects' || parts[0] === 'projects2') {
    return parseProfileFeature('projects2', parts, search);
  }

  const seg = parts[0];
  if (seg === 'finance') {
    return {
      feature: 'tz-designer',
      teamProfileId: null,
      teamSubtab: 'profile',
      project2ProfileId: null,
      project2Subtab: 'profile',
    };
  }

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

export { pathForTeamProfile, pathForProject2Profile };
