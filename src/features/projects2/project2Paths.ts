import type { ProjectSubtabId } from './types';

/** Ключі в URL: /projects?profil&id=…, /projects?tasks&id=… */
export type ProjectViewQuery =
  | 'profil'
  | 'tasks'
  | 'documents'
  | 'daily-reports'
  | 'bookings'
  | 'design-brief'
  | 'invoices'
  | 'settings';

export const PROJECT_VIEW_QUERIES: ProjectViewQuery[] = [
  'profil',
  'tasks',
  'documents',
  'daily-reports',
  'bookings',
  'design-brief',
  'invoices',
  'settings',
];

export const QUERY_TO_PROJECT_SUBTAB: Record<ProjectViewQuery, ProjectSubtabId> = {
  profil: 'profile',
  tasks: 'tasks',
  documents: 'documents',
  'daily-reports': 'daily-reports',
  bookings: 'bookings',
  'design-brief': 'design-brief',
  invoices: 'invoices',
  settings: 'settings',
};

export const PROJECT_SUBTAB_TO_QUERY: Record<ProjectSubtabId, ProjectViewQuery> = {
  profile: 'profil',
  tasks: 'tasks',
  documents: 'documents',
  'daily-reports': 'daily-reports',
  bookings: 'bookings',
  'design-brief': 'design-brief',
  invoices: 'invoices',
  settings: 'settings',
};

function decodeId(value: string): string {
  try {
    return decodeURIComponent(value.trim());
  } catch {
    return value.trim();
  }
}

export type ParsedProjectSearch = {
  subtab: ProjectSubtabId;
  projectId: string | null;
};

export function parseProjectSearch(search: string): ParsedProjectSearch {
  if (!search || search === '?') {
    return { subtab: 'profile', projectId: null };
  }

  const raw = search.startsWith('?') ? search.slice(1) : search;
  let subtab: ProjectSubtabId = 'profile';
  let projectId: string | null = null;

  for (const part of raw.split('&').filter(Boolean)) {
    const eq = part.indexOf('=');
    const key = (eq === -1 ? part : part.slice(0, eq)).trim().toLowerCase();
    const value = eq === -1 ? '' : part.slice(eq + 1);

    if ((PROJECT_VIEW_QUERIES as string[]).includes(key)) {
      subtab = QUERY_TO_PROJECT_SUBTAB[key as ProjectViewQuery];
      continue;
    }
    if (key === 'id' && value.trim()) {
      projectId = decodeId(value);
    }
  }

  return { subtab: projectId ? subtab : 'profile', projectId };
}

export function pathForProject2Profile(projectId: string, tab: ProjectSubtabId = 'profile'): string {
  const view = PROJECT_SUBTAB_TO_QUERY[tab];
  return `/projects?${view}&id=${encodeURIComponent(projectId)}`;
}
