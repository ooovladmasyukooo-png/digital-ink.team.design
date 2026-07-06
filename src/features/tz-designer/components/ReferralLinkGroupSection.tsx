import { useEffect, useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import tsStyles from '../../tasks/tasks.module.css';
import { REFERRAL_LINK_STATUS_LABELS } from '../referralLinkOptions';
import type { ReferralLink, ReferralLinkStatus } from '../types';
import { ReferralLinkColumnsHeader } from './ReferralLinkColumnsHeader';
import { ReferralLinkRow } from './ReferralLinkRow';

const STATUS_TONE_CLASS: Record<ReferralLinkStatus, string> = {
  active: tsStyles['ts-group-status-green'],
  inactive: tsStyles['ts-group-status-slate'],
};

interface ReferralLinkGroupSectionProps {
  status: ReferralLinkStatus;
  links: ReferralLink[];
  onOpen: (id: string) => void;
}

export function ReferralLinkGroupSection({ status, links, onOpen }: ReferralLinkGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(() => status === 'inactive');
  const prevLinkCount = useRef(links.length);

  useEffect(() => {
    if (links.length === 0) {
      setCollapsed(true);
    } else if (prevLinkCount.current === 0 && status === 'active') {
      setCollapsed(false);
    }
    prevLinkCount.current = links.length;
  }, [links.length, status]);

  const label = REFERRAL_LINK_STATUS_LABELS[status];

  return (
    <section
      className={cx(tsStyles['ts-group'], tsStyles['ts-group-status'], STATUS_TONE_CLASS[status])}
      aria-label={label}
    >
      <div className={tsStyles['ts-group-head']}>
        <button
          type="button"
          className={tsStyles['ts-group-toggle']}
          onClick={() => setCollapsed((current) => !current)}
          aria-expanded={!collapsed}
        >
          <span className={cx(tsStyles['ts-chev'], collapsed && tsStyles['ts-chev-closed'])}>{Icons.chevD}</span>
          <span className={tsStyles['ts-group-title']}>{label}</span>
        </button>
        <span className={tsStyles['ts-group-count']}>{links.length}</span>
      </div>

      {!collapsed ? (
        <>
          <ReferralLinkColumnsHeader inGroup />
          {links.length > 0 ? (
            <div className={tsStyles['ts-rows']}>
              {links.map((link) => (
                <ReferralLinkRow key={link.id} link={link} onOpen={onOpen} />
              ))}
            </div>
          ) : (
            <p className={tsStyles['ts-group-empty']}>Немає рефералів</p>
          )}
        </>
      ) : null}
    </section>
  );
}
