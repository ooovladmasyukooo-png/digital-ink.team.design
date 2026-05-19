import { Chip } from '../../../shared/components/Chip';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects.module.css';
import type { Project } from '../types';

interface PayoutsTabProps {
  member: Project;
}

const formatCurrency = (value: number) => `₴${value.toLocaleString('uk-UA')}`;

export function PayoutsTab({ member }: PayoutsTabProps) {
  const rows = [
    { period: 'Травень 2026', status: 'pending', base: 120000, bonus: 48200, total: 168200, paid: '-' },
    { period: 'Квітень 2026', status: 'paid', base: 120000, bonus: 62400, total: 182400, paid: '01.05.2026' },
    { period: 'Березень 2026', status: 'paid', base: 120000, bonus: 39800, total: 159800, paid: '01.04.2026' },
  ];

  return (
    <section className={styles['td-sect']}>
      <div className={styles['td-sect-h']}>
        <h3 className={styles['td-sect-t']}>Виплати {member.username} · YTD ₴804K</h3>
        <button className="ghost-btn" type="button">{Icons.download} Експорт</button>
      </div>
      <div className={styles['po-grid']}>
        <div className={styles['po-stat']}><div className="micro">База / міс</div><div className={styles['po-v']}>{formatCurrency(120000)}</div></div>
        <div className={styles['po-stat']}><div className="micro">Партнерська</div><div className={styles['po-v']}>28%</div></div>
        <div className={styles['po-stat']}><div className="micro">Бонус Q2</div><div className={styles['po-v']}>{formatCurrency(150400)}</div></div>
        <div className={styles['po-stat']}><div className="micro">Наступна виплата</div><div className={styles['po-v']}>01.06.2026</div></div>
      </div>
      <div className={cx(styles['dl-tbl'], styles['po-tbl'])}>
        <div className={styles['dl-h']}><div>Період</div><div>Статус</div><div className="num">База</div><div className="num">Бонус</div><div className="num">Разом</div><div>Дата виплати</div></div>
        {rows.map((row) => (
          <div key={row.period} className={styles['dl-r']}>
            <div>{row.period}</div>
            <div><Chip tone={row.status === 'paid' ? 'green' : 'amber'} dot>{row.status === 'paid' ? 'Сплачено' : 'Очікує'}</Chip></div>
            <div className="num mono">{formatCurrency(row.base)}</div>
            <div className="num mono pos">+{formatCurrency(row.bonus)}</div>
            <div className="num mono"><strong>{formatCurrency(row.total)}</strong></div>
            <div className="muted mono">{row.paid}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
