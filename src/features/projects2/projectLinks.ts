import type { ProjectCustomLink, ProjectQuickLinks } from './types';

export const BUILTIN_LINK_KEYS = ['instagram', 'facebookAds', 'googleDrive', 'reporting', 'website'] as const;

export type BuiltinLinkKey = (typeof BUILTIN_LINK_KEYS)[number];

export const BUILTIN_LINK_LABELS: Record<BuiltinLinkKey, string> = {
  instagram: 'Інстаграм',
  facebookAds: 'Facebook Ads',
  googleDrive: 'Google Drive',
  reporting: 'Reporting',
  website: 'Website',
};

export const DEFAULT_LINK_ORDER: string[] = [...BUILTIN_LINK_KEYS];

export function isBuiltinLinkKey(id: string): id is BuiltinLinkKey {
  return (BUILTIN_LINK_KEYS as readonly string[]).includes(id);
}

export function normalizeLinkOrder(order: string[] | undefined, customLinks: ProjectCustomLink[]): string[] {
  const customIds = new Set(customLinks.map((row) => row.id));
  const seen = new Set<string>();
  const result: string[] = [];
  const source = order?.length ? order : [...DEFAULT_LINK_ORDER, ...customLinks.map((row) => row.id)];

  for (const id of source) {
    if (seen.has(id)) continue;
    if (isBuiltinLinkKey(id) || customIds.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }

  for (const key of BUILTIN_LINK_KEYS) {
    if (!seen.has(key)) {
      result.push(key);
      seen.add(key);
    }
  }

  for (const row of customLinks) {
    if (!seen.has(row.id)) {
      result.push(row.id);
      seen.add(row.id);
    }
  }

  return result;
}

export function quickLinksWithUrl(
  quickLinks: ProjectQuickLinks,
  customLinks: ProjectCustomLink[] = [],
  linkOrder?: string[],
) {
  const order = normalizeLinkOrder(linkOrder, customLinks);
  const customById = new Map(customLinks.map((row) => [row.id, row]));

  return order
    .map((id) => {
      if (isBuiltinLinkKey(id)) {
        const url = quickLinks[id]?.trim();
        if (!url) return null;
        return { key: id, label: BUILTIN_LINK_LABELS[id], url };
      }
      const custom = customById.get(id);
      if (!custom?.url.trim()) return null;
      return {
        key: id,
        label: custom.label.trim() || 'Посилання',
        url: custom.url.trim(),
      };
    })
    .filter((item): item is { key: string; label: string; url: string } => item !== null);
}

export function moveLinkOrder(order: string[], fromIndex: number, toIndex: number): string[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= order.length || toIndex >= order.length) {
    return order;
  }
  const next = [...order];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}
