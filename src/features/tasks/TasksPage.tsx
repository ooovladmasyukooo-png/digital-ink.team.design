import { useState } from 'react';
import { Topbar } from '../../shared/components/Topbar';
import type { TopbarTab } from '../../shared/types/common';
import { Icons } from '../../shared/components/Icon';
import { TeamComingSoon } from '../team/components/TeamComingSoon';
import { TaskManager } from './components/TaskManager';
import { useTasksState } from './hooks/useTasksState';
import type { TasksViewTabId } from './types';
import styles from './tasks.module.css';

const TASK_TABS: TopbarTab<TasksViewTabId>[] = [
  { id: 'by-date', label: 'За датами', icon: Icons.calendar },
  { id: 'by-area', label: 'За напрямами', icon: Icons.filter },
  { id: 'personal', label: 'Особисті', icon: Icons.spark },
  { id: 'delegated', label: 'Делеговані', icon: Icons.team },
  { id: 'archive', label: 'Архів', icon: Icons.inbox },
];

const TASKS_COMING_SOON_SUBTITLE: Record<Exclude<TasksViewTabId, 'by-date'>, string> = {
  'by-area': 'Групування задач за напрямками з\'явиться незабаром.',
  personal: 'Особисті задачі будуть тут — розділ у розробці.',
  delegated: 'Делеговані задачі будуть тут — розділ у розробці.',
  archive: 'Архів завершених задач — розділ у розробці.',
};

export function TasksPage() {
  const [activeTab, setActiveTab] = useState<TasksViewTabId>('by-date');
  const tasksApi = useTasksState();

  return (
    <div className={styles['ts-shell']}>
      <Topbar tabs={TASK_TABS} activeTab={activeTab} onTab={setActiveTab} />
      <div className={styles['ts-main']}>
        {activeTab === 'by-date' ? (
          <TaskManager api={tasksApi} tab={activeTab} />
        ) : (
          <TeamComingSoon subtitle={TASKS_COMING_SOON_SUBTITLE[activeTab]} />
        )}
      </div>
    </div>
  );
}
