import { cx } from '../../../shared/styles/cx';
import styles from '../tasks.module.css';
import { columnIcons } from '../taskOptions';

const META_COLS = [
  { key: 'priority', label: 'Пріор.', title: 'Пріоритет', icon: columnIcons.priority },
  { key: 'deadline', label: 'Дедл.', title: 'Дедлайн', icon: columnIcons.deadline },
  { key: 'assignee', label: 'Відповід.', title: 'Відповідальний', icon: columnIcons.assignee },
  { key: 'project', label: 'Проєкт', title: 'Проєкт', icon: columnIcons.project },
] as const;

interface TaskColumnsHeaderProps {
  inGroup?: boolean;
  variant?: 'default' | 'archive' | 'personal' | 'withCompleted';
}

export function TaskColumnsHeader({ inGroup, variant = 'default' }: TaskColumnsHeaderProps) {
  const metaCols =
    variant === 'personal'
      ? META_COLS.filter((col) => col.key !== 'project')
      : META_COLS;
  const showCompleted = variant === 'archive' || variant === 'withCompleted';

  return (
    <div className={cx(styles['ts-cols'], inGroup && styles['ts-cols-in-group'])} role="row">
      <div className={styles['ts-col-tree']} aria-hidden />

      <div className={styles['ts-col-lead']}>
        <span className={styles['ts-col-i']} aria-hidden>
          {columnIcons.status}
        </span>
        <span className={styles['ts-col-label']} title="Статус">
          Статус
        </span>
        <span className={styles['ts-col-i']} aria-hidden>
          {columnIcons.name}
        </span>
        <span className={styles['ts-col-label']} title="Назва">
          Назва
        </span>
      </div>

      {metaCols.map((col) => (
        <div key={col.key} className={cx(styles['ts-col'], styles['ts-col-meta'])}>
          <span className={styles['ts-col-i']} aria-hidden>
            {col.icon}
          </span>
          <span className={styles['ts-col-label']} title={col.title}>
            {col.label}
          </span>
        </div>
      ))}
      {showCompleted ? (
        <div className={cx(styles['ts-col'], styles['ts-col-meta'])}>
          <span className={styles['ts-col-i']} aria-hidden>
            {columnIcons.deadline}
          </span>
          <span className={styles['ts-col-label']} title="Дата виконання">
            Викон.
          </span>
        </div>
      ) : null}
      <div className={styles['ts-col-spacer']} aria-hidden />
    </div>
  );
}
