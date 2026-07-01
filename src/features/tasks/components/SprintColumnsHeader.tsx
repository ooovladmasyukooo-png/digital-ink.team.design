import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { columnIcons } from '../taskOptions';
import styles from '../tasks.module.css';

interface SprintColumnsHeaderProps {
  inGroup?: boolean;
}

export function SprintColumnsHeader({ inGroup }: SprintColumnsHeaderProps) {
  return (
    <div className={cx(styles['ts-cols'], styles['ts-cols-sprint'], inGroup && styles['ts-cols-in-group'])} role="row">
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

      <div className={cx(styles['ts-col'], styles['ts-col-meta'], styles['ts-col-sprint-progress'])}>
        <span className={styles['ts-col-i']} aria-hidden>
          {Icons.analytics}
        </span>
        <span className={styles['ts-col-label']} title="Виконання">
          Виконання
        </span>
      </div>

      <div className={cx(styles['ts-col'], styles['ts-col-meta'])}>
        <span className={styles['ts-col-i']} aria-hidden>
          {columnIcons.priority}
        </span>
        <span className={styles['ts-col-label']} title="Пріоритет">
          Пріор.
        </span>
      </div>

      <div className={cx(styles['ts-col'], styles['ts-col-meta'])}>
        <span className={styles['ts-col-i']} aria-hidden>
          {columnIcons.assignee}
        </span>
        <span className={styles['ts-col-label']} title="Учасники">
          Учасн.
        </span>
      </div>

      <div className={cx(styles['ts-col'], styles['ts-col-meta'], styles['ts-col-sprint-dates'])}>
        <span className={styles['ts-col-i']} aria-hidden>
          {columnIcons.deadline}
        </span>
        <span className={styles['ts-col-label']} title="Термін спринту">
          Термін
        </span>
      </div>

      <div className={styles['ts-col-spacer']} aria-hidden />
    </div>
  );
}
