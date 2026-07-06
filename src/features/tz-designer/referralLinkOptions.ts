import type { ReferralLink, ReferralLinkStatus } from './types';

export const REFERRAL_LINK_STATUS_LABELS: Record<ReferralLinkStatus, string> = {
  active: 'Активний',
  inactive: 'Неактивний',
};

export const REFERRAL_LINK_STATUSES: ReferralLinkStatus[] = ['active', 'inactive'];

export interface ReferralSummary {
  total: number;
  active: number;
  inactive: number;
  accrued: number;
  paid: number;
  frozen: number;
}

export function computeReferralSummary(links: ReferralLink[]): ReferralSummary {
  return links.reduce(
    (summary, link) => ({
      total: summary.total + 1,
      active: summary.active + (link.status === 'active' ? 1 : 0),
      inactive: summary.inactive + (link.status === 'inactive' ? 1 : 0),
      accrued: summary.accrued + link.finance.accrued,
      paid: summary.paid + link.finance.paid,
      frozen: summary.frozen + link.finance.frozen,
    }),
    { total: 0, active: 0, inactive: 0, accrued: 0, paid: 0, frozen: 0 },
  );
}

export function formatReferralConversion(numerator: number, denominator: number): string {
  if (denominator <= 0) return '—';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function formatReferralLinkTitle(link: Pick<ReferralLink, 'masterName' | 'projectName'>): string {
  if (!link.projectName) return link.masterName;
  return `${link.masterName} «${link.projectName}»`;
}

export function formatReferralSubmittedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatReferralMoney(value: number, compact = false): string {
  if (value <= 0) return '—';
  if (compact && value >= 1000) {
    const short = value / 1000;
    const rounded = Number.isInteger(short) ? String(short) : short.toFixed(1).replace('.0', '');
    return `₴${rounded}k`;
  }
  return `₴${value.toLocaleString('uk-UA')}`;
}
