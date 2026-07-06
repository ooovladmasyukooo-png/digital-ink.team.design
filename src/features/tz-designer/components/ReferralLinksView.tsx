import { cx } from '../../../shared/styles/cx';
import tsStyles from '../../tasks/tasks.module.css';
import { REFERRAL_LINK_STATUSES } from '../referralLinkOptions';
import type { ReferralLink } from '../types';
import styles from '../tzDesigner.module.css';
import { ReferralLinkGroupSection } from './ReferralLinkGroupSection';
import { ReferralSummaryStats } from './ReferralSummaryStats';

interface ReferralLinksViewProps {
  links: ReferralLink[];
  onOpen: (id: string) => void;
}

export function ReferralLinksView({ links, onOpen }: ReferralLinksViewProps) {
  return (
    <div className={styles['referral-links-view']}>
      <ReferralSummaryStats links={links} />

      {links.length === 0 ? (
        <div className={cx(tsStyles['ts-by-date'], styles['referrals-ts-shell'])}>
          <p className={tsStyles['ts-empty-state']}>Немає рефералів.</p>
        </div>
      ) : (
        <div className={cx(tsStyles['ts-by-date'], styles['referrals-ts-shell'])}>
          <div className={tsStyles['ts-table']}>
            {REFERRAL_LINK_STATUSES.map((status) => (
              <ReferralLinkGroupSection
                key={status}
                status={status}
                links={links.filter((link) => link.status === status)}
                onOpen={onOpen}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
