import { useEffect, useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { STATUS_META } from '../constants';
import styles from '../tasks.module.css';
import type { Status, Task, TaskPatch, TaskSubtask } from '../types';
import { TaskColumnsHeader } from './TaskColumnsHeader';
import { TaskListTree } from './TaskListTree';

interface TaskStatusGroupSectionProps {
  status: Status;
  label: string;
  tasks: Task[];
  /** Особисті — без «Проєкт»; withCompleted — колонка «Викон.» */
  listVariant?: 'default' | 'personal' | 'withCompleted';
  armedDeleteId: string | null;
  expandedTreeKeys: ReadonlySet<string>;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  onAdd: (status: Status) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
  /** Вкладка задач проєкту: усі групи видимі, порожні розгорнуті, «+» завжди на виду */
  projectGroupMode?: boolean;
}

const STATUS_GROUP_CLASS: Record<string, string | undefined> = {
  slate: styles['ts-group-status-slate'],
  gray: styles['ts-group-status-gray'],
  blue: styles['ts-group-status-blue'],
  purple: styles['ts-group-status-purple'],
  green: styles['ts-group-status-green'],
};

export function TaskStatusGroupSection({
  status,
  label,
  tasks,
  armedDeleteId,
  expandedTreeKeys,
  onToggleTreeExpand,
  onArmDelete,
  onDelete,
  onDuplicate,
  onUpdate,
  onUpdateSubtask,
  onAddSubtask,
  onAdd,
  onOpenTask,
  listVariant = 'default',
  projectGroupMode = false,
}: TaskStatusGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(() =>
    projectGroupMode ? status === 'done' : status === 'done' || tasks.length === 0,
  );
  const prevTaskCount = useRef(tasks.length);

  useEffect(() => {
    if (projectGroupMode) {
      if (prevTaskCount.current === 0 && tasks.length > 0 && status !== 'done') {
        setCollapsed(false);
      }
      prevTaskCount.current = tasks.length;
      return;
    }
    if (tasks.length === 0) {
      setCollapsed(true);
    } else if (prevTaskCount.current === 0 && status !== 'done') {
      setCollapsed(false);
    }
    prevTaskCount.current = tasks.length;
  }, [tasks.length, status, projectGroupMode]);

  const handleAdd = () => {
    setCollapsed(false);
    onAdd(status);
  };

  const tone = STATUS_META[status].tone;
  const toneClass = STATUS_GROUP_CLASS[tone];
  const headerVariant =
    listVariant === 'personal' ? 'personal' : listVariant === 'withCompleted' ? 'withCompleted' : 'default';

  return (
    <section
      className={cx(
        styles['ts-group'],
        styles['ts-group-status'],
        toneClass,
        projectGroupMode && styles['ts-group-project'],
        listVariant === 'withCompleted' && styles['ts-group-with-completed'],
      )}
      aria-label={label}
    >
      <div className={styles['ts-group-head']}>
        <button
          type="button"
          className={styles['ts-group-toggle']}
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          <span className={cx(styles['ts-chev'], collapsed && styles['ts-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['ts-group-title']}>{label}</span>
        </button>
        <span className={styles['ts-group-count']}>{tasks.length}</span>
        <button
          type="button"
          className={styles['ts-group-add']}
          aria-label={`Нова задача: ${label}`}
          onClick={handleAdd}
        >
          {Icons.plus}
        </button>
      </div>

      {!collapsed ? (
        <>
          <TaskColumnsHeader inGroup variant={headerVariant} />
          {tasks.length > 0 ? (
            <div className={styles['ts-rows']}>
              {tasks.map((task) => (
                <TaskListTree
                  key={task.id}
                  task={task}
                  listVariant={listVariant}
                  expandedKeys={expandedTreeKeys}
                  onToggleExpand={onToggleTreeExpand}
                  armedDeleteId={armedDeleteId}
                  onArmDelete={onArmDelete}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onUpdateRoot={onUpdate}
                  onUpdateSubtask={onUpdateSubtask}
                  onAddSubtask={onAddSubtask}
                  onOpen={onOpenTask}
                />
              ))}
            </div>
          ) : (
            <p className={styles['ts-group-empty']}>Немає задач</p>
          )}

          <button type="button" className={styles['ts-new-row']} onClick={handleAdd}>
            {Icons.plus}
            <span>Нова задача</span>
          </button>
        </>
      ) : null}
    </section>
  );
}
