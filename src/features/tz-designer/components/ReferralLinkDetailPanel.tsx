import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import dbStyles from '../../designBrief/designBrief.module.css';
import {
  formatReferralConversion,
  formatReferralLinkTitle,
  formatReferralMoney,
  formatReferralSubmittedAt,
  REFERRAL_LINK_STATUS_LABELS,
} from '../referralLinkOptions';
import type { ReferralLink } from '../types';
import styles from '../tzDesigner.module.css';

interface ReferralLinkDetailPanelProps {
  link: ReferralLink;
  onClose: () => void;
}

export function ReferralLinkDetailPanel({ link, onClose }: ReferralLinkDetailPanelProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const title = formatReferralLinkTitle(link);

  return createPortal(
    <>
      <button
        type="button"
        className={dbStyles['db-drawer-backdrop']}
        aria-label="Закрити реферал"
        onClick={onClose}
      />
      <aside className={dbStyles['db-drawer']} role="dialog" aria-modal="true" aria-label={title}>
        <header className={cx(dbStyles['db-detail-head'], dbStyles['db-detail-head-drawer'])}>
          <div className={styles['material-drawer-head-main']}>
            <div className={styles['material-drawer-head-row']}>
              <span className={styles['material-drawer-k']}>Реферал</span>
              <span
                className={cx(
                  styles['materials-status'],
                  link.status === 'active' ? styles['materials-status-available'] : styles['materials-status-closed'],
                )}
              >
                {REFERRAL_LINK_STATUS_LABELS[link.status]}
              </span>
            </div>
            <span className={cx(styles['material-drawer-updated'], 'mono', 'muted')}>
              Подано {formatReferralSubmittedAt(link.submittedAt)}
            </span>
          </div>
          <button type="button" className={dbStyles['db-drawer-close']} aria-label="Закрити" onClick={onClose}>
            {Icons.close}
          </button>
        </header>

        <div className={dbStyles['db-drawer-scroll']}>
          <div className={dbStyles['db-drawer-body']}>
            <h2 className={styles['referral-drawer-title']}>{title}</h2>

            <div className={dbStyles['db-detail-rows']}>
              <div className={dbStyles['db-detail-row']}>
                <span className={dbStyles['db-detail-k']}>ID</span>
                <span className={cx('mono')}>{link.id}</span>
              </div>
              <div className={dbStyles['db-detail-row']}>
                <span className={dbStyles['db-detail-k']}>Код</span>
                <span className={cx('mono')}>{link.code}</span>
              </div>
              <div className={dbStyles['db-detail-row']}>
                <span className={dbStyles['db-detail-k']}>Майстер</span>
                <span>{link.masterName}</span>
              </div>
              {link.projectName ? (
                <div className={dbStyles['db-detail-row']}>
                  <span className={dbStyles['db-detail-k']}>Проєкт</span>
                  <span>{link.projectName}</span>
                </div>
              ) : null}
            </div>

            <div className={styles['referral-drawer-section']}>
              <div className={styles['material-stats-title']}>Аналітика</div>
              <div className={styles['material-stats-grid']}>
                <div className={styles['material-stat']}>
                  <span className={styles['material-stat-k']}>Перегляди</span>
                  <span className={cx(styles['material-stat-v'], 'mono')}>{link.stats.views}</span>
                </div>
                <div className={styles['material-stat']}>
                  <span className={styles['material-stat-k']}>Кліки</span>
                  <span className={cx(styles['material-stat-v'], 'mono')}>{link.stats.clicks}</span>
                </div>
                <div className={styles['material-stat']}>
                  <span className={styles['material-stat-k']}>Прев&apos;ю</span>
                  <span className={cx(styles['material-stat-v'], 'mono')}>{link.stats.previews}</span>
                </div>
                <div className={styles['material-stat']}>
                  <span className={styles['material-stat-k']}>Приєдналися</span>
                  <span className={cx(styles['material-stat-v'], 'mono')}>{link.stats.joined}</span>
                </div>
              </div>
              <div className={styles['referral-drawer-conv']}>
                <span>
                  Кл./Пер.:{' '}
                  <strong className="mono">
                    {formatReferralConversion(link.stats.clicks, link.stats.views)}
                  </strong>
                </span>
                <span>
                  Реф./Кл.:{' '}
                  <strong className="mono">
                    {formatReferralConversion(link.stats.joined, link.stats.clicks)}
                  </strong>
                </span>
              </div>
            </div>

            <div className={styles['referral-drawer-section']}>
              <div className={styles['material-stats-title']}>Фінанси</div>
              <div className={styles['material-stats-grid']}>
                <div className={styles['material-stat']}>
                  <span className={styles['material-stat-k']}>Нараховано</span>
                  <span className={cx(styles['material-stat-v'], 'mono')}>{formatReferralMoney(link.finance.accrued)}</span>
                </div>
                <div className={styles['material-stat']}>
                  <span className={styles['material-stat-k']}>Виплачено</span>
                  <span className={cx(styles['material-stat-v'], 'mono')}>{formatReferralMoney(link.finance.paid)}</span>
                </div>
                <div className={styles['material-stat']}>
                  <span className={styles['material-stat-k']}>Заморожено</span>
                  <span className={cx(styles['material-stat-v'], 'mono')}>{formatReferralMoney(link.finance.frozen)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}
