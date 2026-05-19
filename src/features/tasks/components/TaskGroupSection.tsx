import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { DATE_GROUP_LABELS } from '../dateGroups';
import styles from '../tasks.module.css';
import type { DateGroupId, Task, TaskPatch } from '../types';
import { TaskColumnsHeader } from './TaskColumnsHeader';
import { TaskRow } from './TaskRow';

interface TaskGroupSectionProps {
  groupId: DateGroupId;
  tasks: Task[];
  armedDeleteId: string | null;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onAdd: (groupId: DateGroupId) => void;
  onOpenTask: (id: string) => void;
}

export function TaskGroupSection({
  groupId,
  tasks,
  armedDeleteId,
  onArmDelete,
  onDelete,
  onUpdate,
  onAdd,
  onOpenTask,
}: TaskGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(
    groupId === 'week' || groupId === 'later' || groupId === 'none'
  );

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
        <button
          type="button"
          className={styles['ts-group-add']}
          aria-label={`Нова задача: ${DATE_GROUP_LABELS[groupId]}`}
          onClick={() => onAdd(groupId)}
        >
          {Icons.plus}
        </button>
      </div>

      {!collapsed ? (
        <>
          <TaskColumnsHeader inGroup />
          <div className={styles['ts-rows']}>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                armedDeleteId={armedDeleteId}
                onArmDelete={onArmDelete}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onOpen={() => onOpenTask(task.id)}
              />
            ))}
          </div>

          <button type="button" className={styles['ts-new-row']} onClick={() => onAdd(groupId)}>
            {Icons.plus}
            <span>Нова задача</span>
          </button>
        </>
      ) : null}
    </section>
  );
}
