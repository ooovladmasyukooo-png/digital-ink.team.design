import { useCallback, useEffect, useMemo, useState } from 'react';
import { Topbar } from '../../shared/components/Topbar';
import type { TopbarTab } from '../../shared/types/common';
import { TaskDrawer } from './components/TaskDrawer';
import { TasksBoard, type TaskSection } from './components/TasksBoard';
import { ASSIGNEE_OPTIONS, createInitialTasks } from './data';
import { CURRENT_USER_ID, filterTasksForTab, groupTasksByDate } from './groupTasks';
import { Icons } from '../../shared/components/Icon';
import { TeamComingSoon } from '../team/components/TeamComingSoon';
import type { Task, TasksViewTabId } from './types';
import styles from './tasks.module.css';

let newTaskSeq = 0;
const newTaskId = () => `t-new-${Date.now()}-${++newTaskSeq}`;

function deadlineForSection(sectionId: string): string | null {
  const now = new Date();
  const ymd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  if (sectionId === 'today' || sectionId === 'overdue') return ymd(now);
  if (sectionId === 'tomorrow') {
    const t = new Date(now); t.setDate(t.getDate() + 1); return ymd(t);
  }
  if (sectionId === 'this_week') {
    const t = new Date(now); t.setDate(t.getDate() + 3); return ymd(t);
  }
  return null;
}

const TASK_TAB_META: Record<
  TasksViewTabId,
  { label: string; icon?: TopbarTab<TasksViewTabId>['icon']; hint: string }
> = {
  'by-date': {
    label: 'За датами',
    icon: Icons.calendar,
    hint: 'Групи за дедлайном. Усередині груп пріоритет: від вищого до нижчого.',
  },
  'by-area': {
    label: 'За напрямами',
    icon: Icons.filter,
    hint: 'Згруповано за назвою проєкту.',
  },
  personal: {
    label: 'Особисті',
    icon: Icons.spark,
    hint: 'Де ви відповідальний. Без завершених.',
  },
  delegated: {
    label: 'Делеговані',
    icon: Icons.team,
    hint: 'Створені вами, виконує інша людина.',
  },
  archive: {
    label: 'Архів',
    icon: Icons.inbox,
    hint: 'Завершені задачі.',
  },
};

const TASK_TABS: TopbarTab<TasksViewTabId>[] = (Object.keys(TASK_TAB_META) as TasksViewTabId[]).map(
  (id) => ({
    id,
    label: TASK_TAB_META[id].label,
    icon: TASK_TAB_META[id].icon,
  }),
);

const TASKS_COMING_SOON_SUBTITLE: Record<Exclude<TasksViewTabId, 'by-date'>, string> = {
  'by-area': 'Групування задач за напрямками з\'явиться незабаром.',
  personal: 'Особисті задачі будуть тут — розділ у розробці.',
  delegated: 'Делеговані задачі будуть тут — розділ у розробці.',
  archive: 'Архів завершених задач — розділ у розробці.',
};

interface TasksPageProps {
  onAddTeam?: () => void;
}

export function TasksPage({ onAddTeam }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>(createInitialTasks);
  const [activeTab, setActiveTab] = useState<TasksViewTabId>('by-date');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [activeTab]);

  const replaceTask = useCallback((next: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === next.id ? next : t)));
  }, []);

  const addTask = useCallback((sectionId: string, title: string) => {
    const me = ASSIGNEE_OPTIONS.find((a) => a.id === CURRENT_USER_ID)!;
    const task: Task = {
      id: newTaskId(),
      title,
      description: '',
      status: 'todo',
      priority: 'normal',
      deadline: deadlineForSection(sectionId),
      projectId: '',
      projectName: '',
      assigneeId: me.id,
      assignee: me,
      createdById: me.id,
      subtasks: [],
    };
    setTasks((prev) => [...prev, task]);
    setSelectedId(task.id);
  }, []);

  const tasksForDateBoard = useMemo(() => filterTasksForTab(tasks, 'by-date'), [tasks]);

  const showTasksBoard = activeTab === 'by-date';

  const { sections, taskMap, emptyMessage } = useMemo(() => {
    if (!showTasksBoard) {
      return {
        sections: [] as TaskSection[],
        taskMap: new Map<string, Task[]>(),
        emptyMessage: undefined as string | undefined,
      };
    }

    const g = groupTasksByDate(tasksForDateBoard);
    if (!g.length) {
      return {
        sections: [] as TaskSection[],
        taskMap: new Map<string, Task[]>(),
        emptyMessage: 'Немає задач у цьому вигляді.',
      };
    }
    return {
      sections: g.map((x) => ({
        id: x.id,
        label: x.label,
        meta: x.meta,
        tone: x.id === 'overdue' ? ('overdue' as const) : undefined,
      })),
      taskMap: new Map(g.map((x) => [x.id, x.tasks] as const)),
      emptyMessage: undefined,
    };
  }, [tasksForDateBoard, showTasksBoard]);

  const selected = showTasksBoard && selectedId ? tasks.find((t) => t.id === selectedId) ?? null : null;

  return (
    <div className={styles['ts-shell']}>
      <Topbar tabs={TASK_TABS} activeTab={activeTab} onTab={setActiveTab} />
      <div className={styles['ts-main']}>
        {showTasksBoard ? (
          <TasksBoard
            groupingKind="date"
            dateTabLayout
            sections={sections}
            tasksBySection={taskMap}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={replaceTask}
            onAdd={addTask}
            onAddTeam={onAddTeam}
            emptyMessage={emptyMessage}
          />
        ) : (
          <TeamComingSoon subtitle={TASKS_COMING_SOON_SUBTITLE[activeTab]} />
        )}
      </div>
      {selected ? (
        <TaskDrawer task={selected} onClose={() => setSelectedId(null)} onChange={replaceTask} />
      ) : null}
    </div>
  );
}
