import type { ReactNode } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import tsStyles from '../../tasks/tasks.module.css';
import { REFERRAL_LINK_STATUS_LABELS } from '../referralLinkOptions';
import type { ReferralLinkStatus } from '../types';
import styles from '../tzDesigner.module.css';

type ReferralLinkTone = 'green' | 'slate';

const REFERRAL_LINK_META: Record<
  ReferralLinkStatus,
  { tone: ReferralLinkTone; icon: ReactNode; label: string }
> = {
  active: { tone: 'green', icon: Icons.link, label: REFERRAL_LINK_STATUS_LABELS.active },
  inactive: { tone: 'slate', icon: Icons.archive, label: REFERRAL_LINK_STATUS_LABELS.inactive },
};

export function ReferralLinkStatusBadge({
  status,
  compact = false,
}: {
  status: ReferralLinkStatus;
  compact?: boolean;
}) {
  const meta = REFERRAL_LINK_META[status];

  return (
    <span
      className={cx(
        tsStyles['ts-status'],
        tsStyles['ts-subtask-status-only'],
        !compact && tsStyles['ts-status-sm'],
        tsStyles[`ts-status-${meta.tone}`],
        compact && styles['referral-status-badge-compact'],
      )}
      title={meta.label}
    >
      <span className={cx(tsStyles['ts-status-i'], compact && styles['referral-status-icon-compact'])}>
        {meta.icon}
      </span>
    </span>
  );
}
