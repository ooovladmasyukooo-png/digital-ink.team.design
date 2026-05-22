import { formatDesignBriefRef } from './designBriefRef';

export type ParsedDesignBriefSearch = {
  briefId: string | null;
  /** Повна сторінка: /design-brief?id=… без ключа list */
  full: boolean;
};

function decodeId(value: string): string {
  try {
    return decodeURIComponent(value.trim());
  } catch {
    return value.trim();
  }
}

export function parseDesignBriefSearch(search: string): ParsedDesignBriefSearch {
  if (!search || search === '?') {
    return { briefId: null, full: false };
  }

  const raw = search.startsWith('?') ? search.slice(1) : search;
  let briefId: string | null = null;
  let hasListKey = false;
  let full = false;

  for (const part of raw.split('&').filter(Boolean)) {
    const eq = part.indexOf('=');
    const key = (eq === -1 ? part : part.slice(0, eq)).trim().toLowerCase();
    const value = eq === -1 ? '' : part.slice(eq + 1);

    if (key === 'list') {
      hasListKey = true;
      continue;
    }
    if (key === 'full') {
      full = true;
      continue;
    }
    if ((key === 'id' || key === 'task') && value.trim()) {
      briefId = decodeId(value);
    }
  }

  if (briefId && !hasListKey) {
    full = true;
  }

  return { briefId, full };
}

export function designBriefDocumentTitle(): string {
  return 'ТЗ дизайнеру · Aurora CRM';
}

export function pathForDesignBrief(): string {
  return '/design-brief';
}

/** Query для drawer: ?list&id=db1 */
export function buildDesignBriefDrawerSearch(briefId: string): string {
  return `?list&id=${encodeURIComponent(briefId)}`;
}

/** Повний шлях (поділитися, href): /design-brief?id=db1 */
export function buildDesignBriefTaskLink(briefId: string): string {
  return `/design-brief?id=${encodeURIComponent(briefId)}`;
}

export type BuildDesignBriefUrlOpts = {
  brief?: string | null;
  full?: boolean;
};

export function buildDesignBriefUrl(opts: BuildDesignBriefUrlOpts): string {
  if (!opts.brief) return pathForDesignBrief();
  if (opts.full) return buildDesignBriefTaskLink(opts.brief);
  return `/design-brief${buildDesignBriefDrawerSearch(opts.brief)}`;
}

export function designBriefItemDocumentTitle(title: string, briefId: string): string {
  return `${title} · ${formatDesignBriefRef(briefId)} · ТЗ дизайнеру · Aurora CRM`;
}
