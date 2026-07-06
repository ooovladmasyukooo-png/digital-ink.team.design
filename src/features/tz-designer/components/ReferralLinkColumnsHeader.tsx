import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { columnIcons } from '../../tasks/taskOptions';
import tsStyles from '../../tasks/tasks.module.css';
import styles from '../tzDesigner.module.css';

const STAT_COLS = [
  { label: 'Перегл.', title: 'Перегляди' },
  { label: 'Кліки', title: 'Кліки' },
  { label: 'Прев\'ю', title: 'Прев\'ю' },
  { label: 'Кл./Пер.', title: 'Конверсія: кліки / перегляди' },
  { label: 'Реф./Кл.', title: 'Конверсія: реферали / кліки' },
  { label: 'Нарах.', title: 'Нараховано' },
  { label: 'Випл.', title: 'Виплачено' },
  { label: 'Замор.', title: 'Заморожено' },
  { label: 'Подано', title: 'Дата подачі' },
] as const;

interface ReferralLinkColumnsHeaderProps {
  inGroup?: boolean;
}

export function ReferralLinkColumnsHeader({ inGroup }: ReferralLinkColumnsHeaderProps) {
  return (
    <div
      className={cx(
        tsStyles['ts-cols'],
        styles['referrals-grid-row'],
        inGroup && tsStyles['ts-cols-in-group'],
      )}
      role="row"
    >
      <div className={tsStyles['ts-col-tree']} aria-hidden />

      <div className={tsStyles['ts-col-lead']}>
        <span className={tsStyles['ts-col-i']} aria-hidden>
          {columnIcons.status}
        </span>
        <span className={tsStyles['ts-col-label']} title="Статус">
          Статус
        </span>
        <span className={tsStyles['ts-col-i']} aria-hidden>
          {Icons.link}
        </span>
        <span className={tsStyles['ts-col-label']} title="Майстер / проєкт">
          Реферал
        </span>
      </div>

      {STAT_COLS.map((col) => (
        <div key={col.label} className={cx(tsStyles['ts-col'], tsStyles['ts-col-meta'])}>
          <span className={tsStyles['ts-col-label']} title={col.title}>
            {col.label}
          </span>
        </div>
      ))}
    </div>
  );
}
