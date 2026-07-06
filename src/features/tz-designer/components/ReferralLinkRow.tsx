import { cx } from '../../../shared/styles/cx';
import tsStyles from '../../tasks/tasks.module.css';
import {
  formatReferralConversion,
  formatReferralLinkTitle,
  formatReferralMoney,
  formatReferralSubmittedAt,
} from '../referralLinkOptions';
import type { ReferralLink } from '../types';
import styles from '../tzDesigner.module.css';
import { ReferralLinkStatusBadge } from './ReferralLinkStatusBadge';

interface ReferralLinkRowProps {
  link: ReferralLink;
  onOpen: (id: string) => void;
}

export function ReferralLinkRow({ link, onOpen }: ReferralLinkRowProps) {
  const clickViewConv = formatReferralConversion(link.stats.clicks, link.stats.views);
  const referralClickConv = formatReferralConversion(link.stats.joined, link.stats.clicks);

  const title = formatReferralLinkTitle(link);

  return (
    <div className={cx(tsStyles['ts-row'], styles['referrals-grid-row'], styles['referral-link-row-compact'])}>
      <div className={cx(tsStyles['ts-cell-tree'], styles['referral-row-tree'])} aria-hidden />

      <div className={cx(tsStyles['ts-cell-lead'], styles['referral-list-lead'])}>
        <div
          className={cx(tsStyles['ts-cell-btn'], tsStyles['ts-status-inline'], styles['referral-row-status'])}
          aria-hidden
        >
          <ReferralLinkStatusBadge status={link.status} compact />
        </div>

        <button
          type="button"
          className={cx(tsStyles['ts-title-btn'], styles['referral-link-title-btn'])}
          onClick={() => onOpen(link.id)}
          aria-label={`Відкрити: ${title}`}
          title={`${title} · ${link.id} · ${link.code}`}
        >
          <span className={cx(tsStyles['ts-title-t'], styles['referral-link-line'])}>
            {link.masterName}
            {link.projectName ? (
              <span className={styles['referral-link-project']}> «{link.projectName}»</span>
            ) : null}
            <span className={cx(styles['referral-link-meta'], 'mono')}>
              {' · '}
              {link.id} · {link.code}
            </span>
          </span>
        </button>
      </div>

      <div className={cx(styles['referrals-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{link.stats.views}</span>
      </div>
      <div className={cx(styles['referrals-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{link.stats.clicks}</span>
      </div>
      <div className={cx(styles['referrals-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{link.stats.previews}</span>
      </div>
      <div className={cx(styles['referrals-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{clickViewConv}</span>
      </div>
      <div className={cx(styles['referrals-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{referralClickConv}</span>
      </div>
      <div className={cx(styles['referrals-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{formatReferralMoney(link.finance.accrued, true)}</span>
      </div>
      <div className={cx(styles['referrals-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{formatReferralMoney(link.finance.paid, true)}</span>
      </div>
      <div className={cx(styles['referrals-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{formatReferralMoney(link.finance.frozen, true)}</span>
      </div>
      <div className={styles['referrals-stat-cell']}>
        <span className={cx(tsStyles['ts-deadline-t'], 'mono')}>{formatReferralSubmittedAt(link.submittedAt)}</span>
      </div>
    </div>
  );
}
