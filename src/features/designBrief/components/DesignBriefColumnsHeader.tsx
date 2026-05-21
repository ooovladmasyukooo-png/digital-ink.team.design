import { cx } from '../../../shared/styles/cx';
import styles from '../designBrief.module.css';
import { columnIcons } from '../designBriefOptions';

const META_COLS = [
  { key: 'priority', label: 'Пріор.', title: 'Пріоритет', icon: columnIcons.priority },
  { key: 'deadline', label: 'Дедл.', title: 'Дедлайн', icon: columnIcons.deadline },
  { key: 'assignee', label: 'Відповід.', title: 'Відповідальний', icon: columnIcons.assignee },
  { key: 'project', label: 'Проєкт', title: 'Проєкт', icon: columnIcons.project },
] as const;

interface DesignBriefColumnsHeaderProps {
  inGroup?: boolean;
  variant?: 'default' | 'archive' | 'personal' | 'withCompleted';
}

export function DesignBriefColumnsHeader({ inGroup, variant = 'default' }: DesignBriefColumnsHeaderProps) {
  const metaCols =
    variant === 'personal'
      ? META_COLS.filter((col) => col.key !== 'project')
      : META_COLS;
  const showCompleted = variant === 'archive' || variant === 'withCompleted';

  return (
    <div className={cx(styles['db-cols'], inGroup && styles['db-cols-in-group'])} role="row">
      <div className={styles['db-col-tree']} aria-hidden />

      <div className={styles['db-col-lead']}>
        <span className={styles['db-col-i']} aria-hidden>
          {columnIcons.status}
        </span>
        <span className={styles['db-col-label']} title="Статус">
          Статус
        </span>
        <span className={styles['db-col-i']} aria-hidden>
          {columnIcons.name}
        </span>
        <span className={styles['db-col-label']} title="Назва">
          Назва
        </span>
      </div>

      {metaCols.map((col) => (
        <div key={col.key} className={cx(styles['db-col'], styles['db-col-meta'])}>
          <span className={styles['db-col-i']} aria-hidden>
            {col.icon}
          </span>
          <span className={styles['db-col-label']} title={col.title}>
            {col.label}
          </span>
        </div>
      ))}
      {showCompleted ? (
        <div className={cx(styles['db-col'], styles['db-col-meta'])}>
          <span className={styles['db-col-i']} aria-hidden>
            {columnIcons.deadline}
          </span>
          <span className={styles['db-col-label']} title="Дата виконання">
            Викон.
          </span>
        </div>
      ) : null}
      <div className={styles['db-col-spacer']} aria-hidden />
    </div>
  );
}
