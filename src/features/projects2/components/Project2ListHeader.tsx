import type { ReactNode } from 'react';
import styles from '../projects2.module.css';

interface Project2ListHeaderProps {
  count: number;
  action?: ReactNode;
}

export function Project2ListHeader({ count, action }: Project2ListHeaderProps) {
  return (
    <header className={`${styles['p2-stacked-header']} ${styles['p2-stacked-header--list']}`}>
      <div className={styles['p2-list-head']}>
        <div className={styles['p2-list-title-row']}>
          <h1 className={styles['p2-list-title']}>Проєкти</h1>
          <span className={styles['p2-list-count']}>{count}</span>
        </div>
        <p className={styles['p2-list-sub']}>Усі студії та майстри в одному каталозі</p>
      </div>
      {action ? <div className={styles['p2-list-head-action']}>{action}</div> : null}
    </header>
  );
}
