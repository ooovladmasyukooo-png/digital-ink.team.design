import { useCallback, useMemo, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import {
  DEFAULT_EXPANDED_DATE_GROUPS,
  deadlineForDateGroup,
  filterTasksForTab,
  groupTasksByDate,
  type DateGroupId,
} from '../groupTasks';
import type { TasksViewTabId } from '../types';
import type { TaskPriority } from '../types';
import type { TasksStateApi } from '../hooks/useTasksState';
import { TaskGroup } from './TaskGroup';
import styles from '../tasks.module.css';

type FilterPriority = TaskPriority | 'all';

interface TaskManagerProps {
  api: TasksStateApi;
  tab: TasksViewTabId;
}

export function TaskManager({ api, tab }: TaskManagerProps) {
  const [expanded, setExpanded] = useState<Set<DateGroupId>>(() => new Set(DEFAULT_EXPANDED_DATE_GROUPS));
  const [draftByGroup, setDraftByGroup] = useState<Partial<Record<DateGroupId, string>>>({});
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [hideEmpty, setHideEmpty] = useState(false);

  const groups = useMemo(() => {
    let filtered = filterTasksForTab(api.tasks, tab);
    if (filterPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }
    return groupTasksByDate(filtered);
  }, [api.tasks, tab, filterPriority]);

  const totalCount = useMemo(() => groups.reduce((sum, g) => sum + g.tasks.filter((t) => !t.isDraft).length, 0), [groups]);

  const visibleGroups = hideEmpty ? groups.filter((g) => g.tasks.length > 0) : groups;

  const toggleGroup = (id: DateGroupId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const closeCompose = useCallback((groupId: DateGroupId) => {
    setDraftByGroup((prev) => {
      if (!prev[groupId]) return prev;
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  }, []);

  const startCompose = useCallback(
    (groupId: DateGroupId) => {
      const existing = draftByGroup[groupId];
      if (existing) return;

      const deadline = deadlineForDateGroup(groupId);
      const id = api.addTask(deadline, { draft: true });
      setDraftByGroup((prev) => ({ ...prev, [groupId]: id }));
      setExpanded((prev) => new Set(prev).add(groupId));
    },
    [api, draftByGroup],
  );

  return (
    <div className={styles['tm']}>
      <div className={styles['tm-header']}>
        <div className={styles['tm-header-left']}>
          <h2 className={styles['tm-title']}>Задачі за датами</h2>
          <span className={styles['tm-count']}>{totalCount}</span>
        </div>
        <div className={styles['tm-filters']}>
          <button
            type="button"
            className={styles['tm-filter-btn']}
            data-active={filterPriority !== 'all' ? '' : undefined}
            onClick={() => setFilterPriority(filterPriority === 'all' ? 'urgent' : filterPriority === 'urgent' ? 'high' : filterPriority === 'high' ? 'normal' : 'all')}
          >
            {Icons.flag}
            <span>{filterPriority === 'all' ? 'Пріоритет' : filterPriority === 'urgent' ? 'Терміново' : filterPriority === 'high' ? 'Високий' : 'Звичайний'}</span>
          </button>
          <button
            type="button"
            className={styles['tm-filter-btn']}
            data-active={hideEmpty ? '' : undefined}
            onClick={() => setHideEmpty(!hideEmpty)}
          >
            {Icons.filter}
            <span>{hideEmpty ? 'Показати всі' : 'Сховати порожні'}</span>
          </button>
        </div>
      </div>

      {visibleGroups.map((g) => (
        <TaskGroup
          key={g.id}
          id={g.id}
          label={g.label}
          meta={g.meta}
          tasks={g.tasks}
          expanded={expanded.has(g.id)}
          onToggle={() => toggleGroup(g.id)}
          api={api}
          draftTaskId={draftByGroup[g.id] ?? null}
          onStartCompose={() => startCompose(g.id)}
          onComposeClose={() => closeCompose(g.id)}
        />
      ))}
    </div>
  );
}
