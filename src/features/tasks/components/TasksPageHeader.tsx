import type { ReactNode } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import type { TasksViewTabId } from '../types';
import styles from '../tasks.module.css';

const TASK_TABS: { id: TasksViewTabId; label: string; icon: ReactNode }[] = [
  { id: 'by-date', label: 'За датами', icon: Icons.calendar },
  { id: 'by-area', label: 'По проектах', icon: Icons.filter },
  { id: 'personal', label: 'Особисті', icon: Icons.spark },
  { id: 'delegated', label: 'Делеговані', icon: Icons.team },
  { id: 'archive', label: 'Архів', icon: Icons.inbox },
];

interface TasksPageHeaderProps {
  activeTab: TasksViewTabId;
  onTab: (tabId: TasksViewTabId) => void;
}

export function TasksPageHeader({ activeTab, onTab }: TasksPageHeaderProps) {
  return (
    <header className={styles['ts-stacked-header']}>
      <div className={styles['ts-stacked-top']}>
        <h1 className={styles['ts-stacked-title']}>Задачі</h1>
      </div>
      <nav className={styles['ts-stacked-tabs']} aria-label="Вкладки задач">
        {TASK_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cx(styles['ts-tab'], activeTab === tab.id && styles.on)}
            onClick={() => onTab(tab.id)}
          >
            <span className={styles['ts-tab-i']}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
