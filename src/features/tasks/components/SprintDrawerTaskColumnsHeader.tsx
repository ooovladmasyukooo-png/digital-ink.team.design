import { cx } from '../../../shared/styles/cx';
import styles from '../tasks.module.css';
import { columnIcons } from '../taskOptions';

const DRAWER_META_COLS = [
  { key: 'tags', icon: columnIcons.tags, title: 'Теги' },
  { key: 'priority', icon: columnIcons.priority, title: 'Пріоритет' },
  { key: 'deadline', icon: columnIcons.deadline, title: 'Дедлайн' },
  { key: 'assignee', icon: columnIcons.assignee, title: 'Відповідальний' },
] as const;

export function SprintDrawerTaskColumnsHeader() {
  return (
    <div className={cx(styles['ts-cols'], styles['ts-cols-in-group'], styles['ts-sprint-drawer-cols'])} role="row">
      <div className={styles['ts-col-lead']} aria-hidden />
      {DRAWER_META_COLS.map((col) => (
        <div
          key={col.key}
          className={cx(styles['ts-col'], styles['ts-col-meta'], styles['ts-sprint-drawer-col-meta'])}
          title={col.title}
        >
          <span className={styles['ts-col-i']} aria-hidden>
            {col.icon}
          </span>
        </div>
      ))}
    </div>
  );
}
