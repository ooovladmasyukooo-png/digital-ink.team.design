import { useEffect, useState } from 'react';
import { Chip } from '../../shared/components/Chip';
import { Icons } from '../../shared/components/Icon';
import { cx } from '../../shared/styles/cx';
import { buildClientReferralLink } from '../projects2/projectClientContacts';
import dbStyles from '../designBrief/designBrief.module.css';
import { designerReferral, referralTransactions } from './data';
import styles from './tzDesigner.module.css';

const formatCurrency = (value: number) => `₴${value.toLocaleString('uk-UA')}`;

export function TzDesignerPage() {
  const referralLink = buildClientReferralLink(designerReferral.code);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'TZ Designer · Aurora CRM';
  }, []);

  useEffect(() => {
    if (!copyToast) return;
    const timer = window.setTimeout(() => setCopyToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copyToast]);

  const copyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopyToast('Посилання скопійовано');
    } catch {
      setCopyToast('Не вдалося скопіювати');
    }
  };

  return (
    <div className={dbStyles['db-shell']}>
      <div className={dbStyles['db-main']}>
        <div className={dbStyles['db-design-brief-shell']}>
          <header className={dbStyles['db-stacked-header']}>
            <div className={dbStyles['db-design-brief-header']}>
              <div className={dbStyles['db-design-brief-header-main']}>
                <div className={dbStyles['db-design-brief-header-title-row']}>
                  <h1 className={dbStyles['db-design-brief-header-title']}>TZ Designer</h1>
                  <span className={dbStyles['db-design-brief-header-count']}>{referralTransactions.length}</span>
                </div>
              </div>
            </div>
            <div className={dbStyles['db-stacked-tabs-bar']}>
              <nav className={dbStyles['db-stacked-tabs']} aria-label="TZ Designer">
                <button type="button" className={cx(dbStyles['db-tab'], dbStyles.on)} aria-current="page">
                  <span className={dbStyles['db-tab-i']}>{Icons.link}</span>
                  <span>Рефералка</span>
                </button>
              </nav>
            </div>
          </header>

          <div className={styles['tz-content']}>
            <div className={styles['referral-card']}>
              <div className={styles['referral-main']}>
                <div className={styles['referral-k']}>Ваше реферальне посилання</div>
                <div className={styles['referral-link-row']}>
                  <input
                    className={styles['referral-link-in']}
                    type="text"
                    readOnly
                    tabIndex={-1}
                    value={referralLink}
                    aria-readonly="true"
                  />
                  <button
                    type="button"
                    className={styles['referral-copy']}
                    aria-label="Копіювати реферальне посилання"
                    title="Копіювати посилання"
                    onClick={copyReferralLink}
                  >
                    {Icons.duplicate}
                  </button>
                </div>
                <div className={styles['referral-meta']}>
                  <span>
                    Код: <span className={styles['referral-code']}>{designerReferral.code}</span>
                  </span>
                  <span className="muted">{designerReferral.activeClients} активних клієнтів</span>
                </div>
              </div>
              <div className={styles['referral-stats']}>
                <div className={styles['referral-stat']}>
                  <div className={styles['referral-stat-k']}>Нараховано</div>
                  <div className={cx(styles['referral-stat-v'], styles.pos)}>{formatCurrency(designerReferral.totalEarned)}</div>
                </div>
                <div className={styles['referral-stat']}>
                  <div className={styles['referral-stat-k']}>В обробці</div>
                  <div className={styles['referral-stat-v']}>{formatCurrency(designerReferral.pending)}</div>
                </div>
                <div className={styles['referral-stat']}>
                  <div className={styles['referral-stat-k']}>Транзакції</div>
                  <div className={styles['referral-stat-v']}>{referralTransactions.length}</div>
                </div>
              </div>
            </div>

            <div className={styles['tx-card']}>
              <div className={styles['tx-card-head']}>
                <div>
                  <h2 className={styles['tx-card-title']}>Реферальні транзакції</h2>
                  <p className={styles['tx-card-sub']}>комісії за підключених клієнтів</p>
                </div>
                <div className={styles['tx-card-actions']}>
                  <button className="ghost-btn sm" type="button">
                    {Icons.filter} Фільтр
                  </button>
                  <button className="ghost-btn sm" type="button">
                    {Icons.download} CSV
                  </button>
                </div>
              </div>
              <div className={cx('tbl', styles['tbl-ref'])}>
                <div className="tbl-h">
                  <div>ID</div>
                  <div>Проєкт</div>
                  <div>Реф. код</div>
                  <div>Статус</div>
                  <div className="num">Комісія</div>
                  <div>Дата</div>
                </div>
                {referralTransactions.map((tx) => (
                  <div key={tx.id} className="tbl-r">
                    <div className="mono muted">{tx.id}</div>
                    <div>{tx.project}</div>
                    <div className="mono">{tx.refCode}</div>
                    <div>
                      <Chip tone={tx.status === 'cleared' ? 'green' : 'amber'} dot>
                        {tx.status === 'cleared' ? 'Нараховано' : 'В обробці'}
                      </Chip>
                    </div>
                    <div className="num mono pos">+{formatCurrency(tx.amount)}</div>
                    <div className="muted mono">{tx.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {copyToast ? (
        <div className={styles['copy-toast']} role="status" aria-live="polite">
          {copyToast}
        </div>
      ) : null}
    </div>
  );
}
