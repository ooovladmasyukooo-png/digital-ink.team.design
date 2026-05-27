import type { ReactNode } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import type { TasksViewTabId } from '../types';
import styles from '../tasks.module.css';
import { TasksSortSwitcher } from './TasksSortSwitcher';
import { TasksViewerSwitcher } from './TasksViewerSwitcher';
import type { TasksSortField } from '../types';

const TASK_TABS: { id: TasksViewTabId; label: string; icon: ReactNode }[] = [
  { id: 'by-date', label: 'За датами', icon: Icons.calendar },
  { id: 'by-area', label: 'По проектах', icon: Icons.filter },
  { id: 'personal', label: 'Особисті', icon: Icons.spark },
  { id: 'delegated', label: 'Делеговані', icon: Icons.team },
  { id: 'archive', label: 'Архів', icon: Icons.inbox },
];

interface TasksPageHeaderProps {
  activeTab: TasksViewTabId;
  count: number;
  onTab: (tabId: TasksViewTabId) => void;
  onCreateTask: () => void;
  viewerId: string;
  onViewerChange: (memberId: string) => void;
  sortField: TasksSortField;
  onSortChange: (field: TasksSortField) => void;
}

export function TasksPageHeader({
  activeTab,
  count,
  onTab,
  onCreateTask,
  viewerId,
  onViewerChange,
  sortField,
  onSortChange,
}: TasksPageHeaderProps) {
  return (
    <header className={styles['ts-stacked-header']}>
      <div className={styles['ts-stacked-top']}>
        <div className={styles['ts-stacked-title-row']}>
          <h1 className={styles['ts-stacked-title']}>Задачі</h1>
          <span className={styles['ts-tasks-header-count']}>{count}</span>
        </div>
        <button className="red-out-btn" type="button" onClick={onCreateTask}>
          {Icons.plus} Нова задача
        </button>
      </div>
      <div className={styles['ts-stacked-tabs-bar']}>
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
        {activeTab !== 'archive' ? (
          <TasksSortSwitcher sortField={sortField} onSortChange={onSortChange} />
        ) : null}
        <TasksViewerSwitcher viewerId={viewerId} onViewerChange={onViewerChange} />
      </div>
    </header>
  );
}
