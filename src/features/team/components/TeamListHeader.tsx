import type { ReactNode } from 'react';
import styles from '../team.module.css';

interface TeamListHeaderProps {
  count: number;
  action?: ReactNode;
}

export function TeamListHeader({ count, action }: TeamListHeaderProps) {
  return (
    <header className={`${styles['team-stacked-header']} ${styles['team-stacked-header--list']}`}>
      <div className={styles['team-list-head']}>
        <div className={styles['team-list-title-row']}>
          <h1 className={styles['team-list-title']}>Команда</h1>
          <span className={styles['team-list-count']}>{count}</span>
        </div>
        <p className={styles['team-list-sub']}>Усі учасники та ролі в одному каталозі</p>
      </div>
      {action ? <div className={styles['team-list-head-action']}>{action}</div> : null}
    </header>
  );
}
