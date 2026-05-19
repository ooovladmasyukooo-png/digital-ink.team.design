import { cx } from '../../../shared/styles/cx';
import styles from '../tasks.module.css';
import { columnIcons } from '../taskOptions';

const COLS = [
  { key: 'status', label: 'Статус', title: 'Статус', icon: columnIcons.status },
  { key: 'name', label: 'Назва', title: 'Назва', icon: columnIcons.name, wide: true },
  { key: 'priority', label: 'Пріор.', title: 'Пріоритет', icon: columnIcons.priority },
  { key: 'deadline', label: 'Дедл.', title: 'Дедлайн', icon: columnIcons.deadline },
  { key: 'assignee', label: 'Відповід.', title: 'Відповідальний', icon: columnIcons.assignee },
  { key: 'project', label: 'Проєкт', title: 'Проєкт', icon: columnIcons.project },
] as const;

interface TaskColumnsHeaderProps {
  inGroup?: boolean;
}

export function TaskColumnsHeader({ inGroup }: TaskColumnsHeaderProps) {
  return (
    <div className={cx(styles['ts-cols'], inGroup && styles['ts-cols-in-group'])} role="row">
      {COLS.map((col) => (
        <div
          key={col.key}
          className={cx(
            styles['ts-col'],
            col.key === 'name' ? styles['ts-col-name'] : styles['ts-col-meta']
          )}
        >
          <span className={styles['ts-col-i']} aria-hidden>
            {col.icon}
          </span>
          <span className={styles['ts-col-label']} title={col.title}>
            {col.label}
          </span>
        </div>
      ))}
      <div className={styles['ts-col-spacer']} aria-hidden />
    </div>
  );
}
