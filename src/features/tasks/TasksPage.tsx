import { useState } from 'react';
import { TeamComingSoon } from '../team/components/TeamComingSoon';
import { TasksByDateView } from './components/TasksByDateView';
import { TasksPageHeader } from './components/TasksPageHeader';
import type { TasksViewTabId } from './types';
import styles from './tasks.module.css';

const TASKS_TAB_SUBTITLE: Record<Exclude<TasksViewTabId, 'by-date'>, string> = {
  'by-area': 'Групування задач за напрямками з\'явиться незабаром.',
  personal: 'Особисті задачі будуть тут — розділ у розробці.',
  delegated: 'Делеговані задачі будуть тут — розділ у розробці.',
  archive: 'Архів завершених задач — розділ у розробці.',
};

export function TasksPage() {
  const [activeTab, setActiveTab] = useState<TasksViewTabId>('by-date');

  return (
    <div className={styles['ts-shell']}>
      <TasksPageHeader activeTab={activeTab} onTab={setActiveTab} />
      <div className={styles['ts-main']}>
        {activeTab === 'by-date' ? (
          <TasksByDateView />
        ) : (
          <TeamComingSoon subtitle={TASKS_TAB_SUBTITLE[activeTab]} />
        )}
      </div>
    </div>
  );
}
