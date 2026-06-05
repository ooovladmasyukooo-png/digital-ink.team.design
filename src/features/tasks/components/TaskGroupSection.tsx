import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { DATE_GROUP_LABELS } from '../dateGroups';
import { formatDateGroupTasksClipboard } from '../taskGroupClipboard';
import styles from '../tasks.module.css';
import type { DateGroupId, Task, TaskPatch, TaskSubtask } from '../types';
import { TaskColumnsHeader } from './TaskColumnsHeader';
import { TaskListTree } from './TaskListTree';

interface TaskGroupSectionProps {
  groupId: DateGroupId;
  tasks: Task[];
  armedDeleteId: string | null;
  expandedTreeKeys: ReadonlySet<string>;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  onAdd: (groupId: DateGroupId) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
}

export function TaskGroupSection({
  groupId,
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
}: TaskGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(
    groupId === 'week' || groupId === 'later' || groupId === 'none'
  );
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const onCopyGroup = useCallback(async () => {
    const text = formatDateGroupTasksClipboard(groupId, tasks);
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast('Задачі скопійовано в буфер обміну');
    } catch {
      setCopyToast('Не вдалося скопіювати');
    }
    window.setTimeout(() => setCopyToast(null), 2400);
  }, [groupId, tasks]);

  if (tasks.length === 0) return null;

  const isNearGroup = groupId === 'overdue' || groupId === 'today' || groupId === 'tomorrow';
  const isOverdueGroup = groupId === 'overdue';

  return (
    <section
      className={cx(
        styles['ts-group'],
        isNearGroup && styles['ts-group-near'],
        isOverdueGroup && styles['ts-group-overdue'],
      )}
      aria-label={DATE_GROUP_LABELS[groupId]}
    >
      <div className={styles['ts-group-head']}>
        <button
          type="button"
          className={styles['ts-group-toggle']}
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          <span className={cx(styles['ts-chev'], collapsed && styles['ts-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['ts-group-title']}>{DATE_GROUP_LABELS[groupId]}</span>
        </button>
        <span className={styles['ts-group-count']}>{tasks.length}</span>
        <span className={styles['ts-group-head-actions']}>
          <button
            type="button"
            className={cx(styles['ts-group-head-btn'], styles['ts-group-dup'])}
            aria-label={`Копіювати список задач: ${DATE_GROUP_LABELS[groupId]}`}
            title="Копіювати список"
            onClick={() => void onCopyGroup()}
          >
            {Icons.duplicate}
          </button>
          <button
            type="button"
            className={cx(styles['ts-group-head-btn'], styles['ts-group-add'])}
            aria-label={`Нова задача: ${DATE_GROUP_LABELS[groupId]}`}
            onClick={() => onAdd(groupId)}
          >
            {Icons.plus}
          </button>
        </span>
      </div>

      {!collapsed ? (
        <>
          <TaskColumnsHeader inGroup />
          <div className={styles['ts-rows']}>
            {tasks.map((task) => (
              <TaskListTree
                key={task.id}
                task={task}
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

          <button type="button" className={styles['ts-new-row']} onClick={() => onAdd(groupId)}>
            {Icons.plus}
            <span>Нова задача</span>
          </button>
        </>
      ) : null}

      {copyToast
        ? createPortal(
            <div className={styles['ts-copy-toast']} role="status" aria-live="polite">
              {copyToast}
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
