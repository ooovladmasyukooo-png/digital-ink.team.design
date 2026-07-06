import type { ReferralMaterialStats, ReferralMaterialStatus } from './types';

export const REFERRAL_MATERIAL_STATUS_LABELS: Record<ReferralMaterialStatus, string> = {
  draft: 'Драфт',
  available: 'Доступний',
  closed: 'Закритий',
};

export const REFERRAL_MATERIAL_STATUSES: ReferralMaterialStatus[] = ['draft', 'available', 'closed'];

export function formatMaterialUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function createReferralMaterialId(): string {
  return `mat-${Date.now().toString(36)}`;
}

export const EMPTY_REFERRAL_MATERIAL_STATS: ReferralMaterialStats = {
  partnersUsed: 0,
  views: 0,
  linkClicks: 0,
  joined: 0,
};

export function formatMaterialConversion(stats: ReferralMaterialStats): string {
  if (stats.views <= 0) return '—';
  return `${Math.round((stats.joined / stats.views) * 100)}%`;
}
