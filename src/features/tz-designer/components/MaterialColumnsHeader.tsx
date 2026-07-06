import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { columnIcons } from '../../tasks/taskOptions';
import tsStyles from '../../tasks/tasks.module.css';

const STAT_COLS = [
  { label: 'Партн.', title: 'Партнери' },
  { label: 'Перегл.', title: 'Перегляди' },
  { label: 'Кліки', title: 'Кліки' },
  { label: 'Приєдн.', title: 'Приєднання' },
  { label: 'Конв.', title: 'Конверсія' },
] as const;

interface MaterialColumnsHeaderProps {
  inGroup?: boolean;
}

export function MaterialColumnsHeader({ inGroup }: MaterialColumnsHeaderProps) {
  return (
    <div className={cx(tsStyles['ts-cols'], inGroup && tsStyles['ts-cols-in-group'])} role="row">
      <div className={tsStyles['ts-col-tree']} aria-hidden />

      <div className={tsStyles['ts-col-lead']}>
        <span className={tsStyles['ts-col-i']} aria-hidden>
          {columnIcons.status}
        </span>
        <span className={tsStyles['ts-col-label']} title="Статус">
          Статус
        </span>
        <span className={tsStyles['ts-col-i']} aria-hidden>
          {Icons.description}
        </span>
        <span className={tsStyles['ts-col-label']} title="Назва">
          Назва
        </span>
      </div>

      {STAT_COLS.map((col) => (
        <div key={col.label} className={cx(tsStyles['ts-col'], tsStyles['ts-col-meta'])}>
          <span className={tsStyles['ts-col-label']} title={col.title}>
            {col.label}
          </span>
        </div>
      ))}

      <div className={cx(tsStyles['ts-col'], tsStyles['ts-col-meta'])}>
        <span className={tsStyles['ts-col-label']} title="Оновлено">
          Оновлено
        </span>
      </div>

      <div className={tsStyles['ts-col-spacer']} aria-hidden />
    </div>
  );
}
