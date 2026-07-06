import { useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { computeReferralSummary, formatReferralMoney } from '../referralLinkOptions';
import type { ReferralLink } from '../types';
import styles from '../tzDesigner.module.css';

interface ReferralSummaryStatsProps {
  links: ReferralLink[];
}

const SUMMARY_ITEMS = [
  { key: 'active', label: 'Активні' },
  { key: 'inactive', label: 'Неактивні' },
  { key: 'accrued', label: 'Нараховано' },
  { key: 'paid', label: 'Виплачено' },
  { key: 'frozen', label: 'Заморожено' },
  { key: 'total', label: 'Рефералів' },
] as const;

export function ReferralSummaryStats({ links }: ReferralSummaryStatsProps) {
  const summary = useMemo(() => computeReferralSummary(links), [links]);

  const valueFor = (key: (typeof SUMMARY_ITEMS)[number]['key']) => {
    if (key === 'accrued' || key === 'paid' || key === 'frozen') {
      return formatReferralMoney(summary[key]);
    }
    return String(summary[key]);
  };

  return (
    <div className={styles['referral-summary']}>
      {SUMMARY_ITEMS.map((item) => (
        <div key={item.key} className={styles['referral-summary-item']}>
          <div className={styles['referral-summary-k']}>{item.label}</div>
          <div
            className={cx(
              styles['referral-summary-v'],
              item.key === 'accrued' && styles['referral-summary-v-pos'],
              (item.key === 'paid' || item.key === 'frozen') && 'mono',
            )}
          >
            {valueFor(item.key)}
          </div>
        </div>
      ))}
    </div>
  );
}
