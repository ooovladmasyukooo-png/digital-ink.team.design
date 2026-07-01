import { useEffect, useMemo, useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { partitionSprintDrawerTasks } from '../sprintProgress';
import styles from '../tasks.module.css';
import type { Task, TaskPatch, TaskSubtask, TasksSortField } from '../types';
import { StatusBadge } from '../taskOptions';
import { SprintDrawerTaskColumnsHeader } from './SprintDrawerTaskColumnsHeader';
import { TaskListTree } from './TaskListTree';
import { TaskPickerPopover } from './TaskPickerPopover';

interface SprintDrawerTasksSectionProps {
  sprintTasks: Task[];
  searchTasks: Task[];
  armedDeleteId: string | null;
  expandedTreeKeys: ReadonlySet<string>;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  onOpenTask: (taskId: string, subtaskPath?: string[]) => void;
  onAssignTask: (taskId: string) => void;
  onAssignTaskAsSubtask: (taskId: string, rootId: string, parentPath: string[]) => void;
  onCreateTask: () => void;
  sortField: TasksSortField;
}

export function SprintDrawerTasksSection({
  sprintTasks,
  searchTasks,
  armedDeleteId,
  expandedTreeKeys,
  onToggleTreeExpand,
  onArmDelete,
  onDelete,
  onDuplicate,
  onUpdate,
  onUpdateSubtask,
  onAddSubtask,
  onOpenTask,
  onAssignTask,
  onAssignTaskAsSubtask,
  onCreateTask,
  sortField,
}: SprintDrawerTasksSectionProps) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [subtaskPickerTaskId, setSubtaskPickerTaskId] = useState<string | null>(null);
  const subtaskAnchorRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  const { active: activeTasks, completed: completedTasks } = useMemo(
    () => partitionSprintDrawerTasks(sprintTasks, sortField),
    [sprintTasks, sortField],
  );

  const filteredSearch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchTasks.filter((task) => task.title.toLowerCase().includes(q)).slice(0, 12);
  }, [query, searchTasks]);

  const parentPickerItems = useMemo(
    () =>
      sprintTasks.map((task) => ({
        id: task.id,
        label: task.title,
        selected: false,
        searchText: task.title,
      })),
    [sprintTasks],
  );

  const canNestAsSubtask = sprintTasks.length > 0;

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setSubtaskPickerTaskId(null);
  };

  const renderTaskTree = (task: Task) => (
    <TaskListTree
      key={task.id}
      task={task}
      listVariant="personal"
      hideTreeColumn
      hideRowActions
      expandedKeys={expandedTreeKeys}
      onToggleExpand={onToggleTreeExpand}
      armedDeleteId={armedDeleteId}
      onArmDelete={onArmDelete}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onUpdateRoot={onUpdate}
      onUpdateSubtask={onUpdateSubtask}
      onAddSubtask={onAddSubtask}
      onOpen={(rootId, path) => onOpenTask(rootId, path)}
    />
  );

  return (
    <>
      <section className={cx(styles['ts-drawer-block'], styles['ts-sprint-drawer-block'], styles['ts-sprint-drawer-tasks-block'])}>
        <div className={styles['ts-drawer-block-head']}>
          <h3 className={styles['ts-drawer-block-title']}>Задачі в спринті</h3>
          <span className={styles['ts-drawer-block-n']}>{sprintTasks.length}</span>
          <div className={styles['ts-drawer-block-head-actions']}>
            <button
              type="button"
              className={cx(
                styles['ts-sprint-drawer-icon-btn'],
                searchOpen && styles['ts-sprint-drawer-icon-btn-on'],
              )}
              aria-label="Пошук задач для додавання"
              aria-pressed={searchOpen}
              onClick={() => {
                if (searchOpen) {
                  closeSearch();
                  return;
                }
                setSearchOpen(true);
              }}
            >
              {Icons.search}
            </button>
            <button type="button" className={styles['ts-sprint-drawer-add-btn']} onClick={onCreateTask}>
              {Icons.plus}
              <span>Нова</span>
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div className={styles['ts-sprint-drawer-search']}>
            <div className={styles['ts-picker-search']}>
              <div className={styles['ts-picker-search-in']}>
                <span className={styles['ts-picker-search-i']} aria-hidden>
                  {Icons.search}
                </span>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Додати задачу…"
                  aria-label="Пошук задач для додавання"
                />
              </div>
            </div>
            {filteredSearch.length === 0 ? (
              query.trim() ? (
                <p className={styles['ts-drawer-empty']}>Нічого не знайдено.</p>
              ) : null
            ) : (
              <ul className={styles['ts-sprint-drawer-task-list']}>
                {filteredSearch.map((task) => (
                  <li key={task.id} className={styles['ts-sprint-drawer-task-item']}>
                    <div className={styles['ts-sprint-drawer-task-open']}>
                      <StatusBadge status={task.status} />
                      <span className={styles['ts-sprint-drawer-task-title']}>{task.title}</span>
                    </div>
                    <div className={styles['ts-sprint-drawer-task-actions']}>
                      {canNestAsSubtask ? (
                        <button
                          type="button"
                          className={styles['ts-sprint-drawer-task-subtask']}
                          aria-label={`Додати як підзадачу: ${task.title}`}
                          onClick={(e) => {
                            subtaskAnchorRef.current = e.currentTarget;
                            setSubtaskPickerTaskId((current) => (current === task.id ? null : task.id));
                          }}
                        >
                          {Icons.subtree}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={styles['ts-sprint-drawer-task-add']}
                        onClick={() => {
                          onAssignTask(task.id);
                          closeSearch();
                        }}
                      >
                        {Icons.plus}
                        <span>Додати</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div className={styles['ts-drawer-block-body']}>
          {sprintTasks.length === 0 ? (
            <p className={styles['ts-drawer-empty']}>Ще немає задач у цьому спринті.</p>
          ) : (
            <div className={styles['ts-sprint-drawer-tasks']}>
              <SprintDrawerTaskColumnsHeader />
              <div className={styles['ts-rows']}>
                {activeTasks.map(renderTaskTree)}
                {completedTasks.length > 0 ? (
                  <div className={styles['ts-sprint-drawer-tasks-done']}>
                    {completedTasks.map(renderTaskTree)}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>

      {subtaskPickerTaskId && canNestAsSubtask ? (
        <TaskPickerPopover
          open
          anchorRef={subtaskAnchorRef}
          searchable
          width={280}
          items={parentPickerItems}
          onClose={() => setSubtaskPickerTaskId(null)}
          onSelect={(rootId) => {
            onAssignTaskAsSubtask(subtaskPickerTaskId, rootId, []);
            setSubtaskPickerTaskId(null);
            closeSearch();
          }}
        />
      ) : null}
    </>
  );
}
