import { cx } from '../../../shared/styles/cx';
import styles from '../projects.module.css';
import type { Project } from '../types';

interface ActivityTabProps {
  member: Project;
}

export function ActivityTab({ member }: ActivityTabProps) {
  const events = [
    { type: 'deal', ago: '2 хв', text: 'Виграно угоду', strong: 'Mansour Holdings', meta: '₴ 218 400' },
    { type: 'call', ago: '48 хв', text: 'Дзвінок з лідом', strong: 'Marcus Reinhardt', meta: '14:32 → 14:58' },
    { type: 'note', ago: '2 год', text: 'Додано нотатку до', strong: member.name, meta: 'Бюджет підтверджено' },
    { type: 'email', ago: '5 год', text: 'Надіслано пропозицію', strong: 'Petra Novak', meta: 'Aurora Pro · 30%' },
  ];
  const colors: Record<string, string> = {
    deal: 'var(--green)',
    call: 'var(--amber)',
    note: 'var(--purple)',
    email: 'var(--blue)',
  };

  return (
    <section className={styles['td-sect']}>
      <div className={styles['td-sect-h']}>
        <h3 className={styles['td-sect-t']}>Останні дії · 28 за тиждень</h3>
        <div className="seg"><button className="on" type="button">Тиждень</button><button type="button">Місяць</button><button type="button">Все</button></div>
      </div>
      <ul className={styles['act-list']}>
        {events.map((event) => (
          <li key={`${event.ago}-${event.strong}`} className={styles['act-i']}>
            <span className={styles['act-dot']} style={{ background: colors[event.type] }} />
            <div className={styles['act-body']}><div className={styles['act-t']}>{event.text} <strong>{event.strong}</strong></div><div className={cx(styles['act-m'], 'mono')}>{event.meta}</div></div>
            <div className={cx(styles['act-ago'], 'mono')}>{event.ago}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
