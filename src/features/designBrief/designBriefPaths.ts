import { formatDesignBriefRef } from './designBriefRef';

export function designBriefDocumentTitle(): string {
  return 'ТЗ дизайнеру · Aurora CRM';
}

export function pathForDesignBrief(): string {
  return '/design-brief';
}

export function buildDesignBriefTaskLink(briefId: string): string {
  return `/design-brief?id=${encodeURIComponent(briefId)}`;
}

export function designBriefItemDocumentTitle(title: string, briefId: string): string {
  return `${title} · ${formatDesignBriefRef(briefId)} · ТЗ дизайнеру · Aurora CRM`;
}
