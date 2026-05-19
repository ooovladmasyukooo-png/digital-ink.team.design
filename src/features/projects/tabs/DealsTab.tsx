import { Chip } from '../../../shared/components/Chip';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects.module.css';
import type { Project } from '../types';

interface DealsTabProps {
  member: Project;
}

const formatCurrency = (value: number) => `₴${value.toLocaleString('uk-UA')}`;

export function DealsTab({ member }: DealsTabProps) {
  const deals = [
    { id: 'D-0218', client: 'Mansour Holdings', stage: 'Виграно', value: 218400, prob: 100, close: '14.05' },
    { id: 'D-0214', client: 'Reinhardt GmbH', stage: 'Переговори', value: 124000, prob: 82, close: '28.05' },
    { id: 'D-0211', client: 'Sofia Castellano', stage: 'Пропозиція', value: 31500, prob: 62, close: '02.06' },
  ];

  return (
    <section className={styles['td-sect']}>
      <div className={styles['td-sect-h']}>
        <h3 className={styles['td-sect-t']}>Угоди {member.username} · 38 загалом</h3>
        <div className="card-h-r">
          <button className="ghost-btn" type="button">{Icons.filter} Стадія</button>
          <button className="red-out-btn" type="button">{Icons.plus} Нова угода</button>
        </div>
      </div>
      <div className={styles['dl-tbl']}>
        <div className={styles['dl-h']}><div>ID</div><div>Клієнт</div><div>Стадія</div><div className="num">Сума</div><div>Ймовірність</div><div>Закриття</div></div>
        {deals.map((deal) => (
          <div key={deal.id} className={styles['dl-r']}>
            <div className="mono muted">{deal.id}</div>
            <div className={styles['dl-c']}>{deal.client}</div>
            <div><Chip tone={deal.stage === 'Виграно' ? 'green' : 'gray'}>{deal.stage}</Chip></div>
            <div className="num mono pos">{formatCurrency(deal.value)}</div>
            <div className={styles['dl-prob']}><div className={styles['dl-bar']}><span style={{ width: `${deal.prob}%` }} /></div><span className={cx('mono', styles['dl-prob-v'])}>{deal.prob}%</span></div>
            <div className="muted mono">{deal.close}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
