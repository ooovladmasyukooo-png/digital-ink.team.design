import { useRef, useState } from 'react';
import { cx } from '../../../shared/styles/cx';
import { PRIORITIES, STATUS_META } from '../constants';
import { formatTaskDeadline } from '../dateDisplay';
import styles from '../tasks.module.css';
import type { Priority, Status, Task, TaskPatch } from '../types';
import {
  AssigneeCell,
  PriorityBadge,
  ProjectCell,
  StatusBadge,
  assigneePickerItems,
  priorityPickerItems,
  projectPickerItems,
  statusPickerItems,
} from '../taskOptions';
import { TaskDeadlinePicker } from './TaskDeadlinePicker';
import { TaskDeleteButton } from './TaskDeleteButton';
import { TaskPickerPopover } from './TaskPickerPopover';

type PickerField = 'status' | 'priority' | 'deadline' | 'assignee' | 'project' | null;

interface TaskRowProps {
  task: Task;
  armedDeleteId: string | null;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onOpen: () => void;
}

export function TaskRow({ task, armedDeleteId, onArmDelete, onDelete, onUpdate, onOpen }: TaskRowProps) {
  const [picker, setPicker] = useState<PickerField>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const deadlineRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const projectRef = useRef<HTMLButtonElement>(null);

  const anchorFor = (field: Exclude<PickerField, null>) => {
    switch (field) {
      case 'status':
        return statusRef;
      case 'priority':
        return priorityRef;
      case 'deadline':
        return deadlineRef;
      case 'assignee':
        return assigneeRef;
      case 'project':
        return projectRef;
    }
  };

  const togglePicker = (field: Exclude<PickerField, null>) => {
    setPicker((current) => (current === field ? null : field));
  };

  return (
    <div className={styles['ts-row']}>
      <button
        ref={statusRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-status'])}
        onClick={() => togglePicker('status')}
        aria-label={`Статус: ${STATUS_META[task.status].label}`}
      >
        <StatusBadge status={task.status} />
      </button>

      <div className={styles['ts-cell-name']}>
        <button type="button" className={styles['ts-title-btn']} onClick={onOpen} aria-label={`Відкрити: ${task.title}`}>
          <span className={styles['ts-title-t']}>{task.title}</span>
        </button>
      </div>

      <button
        ref={priorityRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-priority'])}
        onClick={() => togglePicker('priority')}
        aria-label={
          task.priority ? `Пріоритет: ${PRIORITIES[task.priority].label}` : 'Пріоритет не встановлено'
        }
      >
        <PriorityBadge priority={task.priority} />
      </button>

      <button
        ref={deadlineRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-deadline'])}
        onClick={() => togglePicker('deadline')}
        aria-label="Дедлайн"
      >
        {task.deadline ? (
          <span className={styles['ts-deadline-t']}>{formatTaskDeadline(task.deadline)}</span>
        ) : (
          <span className={styles['ts-empty']}>—</span>
        )}
      </button>

      <button
        ref={assigneeRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-assignee'])}
        onClick={() => togglePicker('assignee')}
        aria-label="Відповідальний"
      >
        <AssigneeCell assigneeId={task.assigneeId} />
      </button>

      <button
        ref={projectRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-project'])}
        onClick={() => togglePicker('project')}
        aria-label="Проєкт"
      >
        <ProjectCell projectId={task.projectId} />
      </button>

      <div className={styles['ts-row-actions']}>
        <TaskDeleteButton
          taskId={task.id}
          armedId={armedDeleteId}
          onArm={onArmDelete}
          onDelete={onDelete}
        />
      </div>

      {picker === 'deadline' ? (
        <TaskDeadlinePicker
          open
          anchorRef={deadlineRef}
          valueIso={task.deadline}
          onClose={() => setPicker(null)}
          onSelectIso={(iso) => onUpdate(task.id, { deadline: iso })}
        />
      ) : null}

      {picker && picker !== 'deadline' ? (
        <TaskPickerPopover
          open
          anchorRef={anchorFor(picker)}
          searchable={picker === 'assignee' || picker === 'project'}
          width={
            picker === 'assignee' || picker === 'project'
              ? 280
              : picker === 'priority'
                ? 200
                : picker === 'status'
                  ? 168
                  : 220
          }
          compact={picker === 'status'}
          clearOption={
            picker === 'priority'
              ? {
                  id: '__none__',
                  label: 'Clear',
                  selected: task.priority === null,
                }
              : undefined
          }
          items={
            picker === 'status'
              ? statusPickerItems(task.status)
              : picker === 'priority'
                ? priorityPickerItems(task.priority)
                : picker === 'assignee'
                  ? assigneePickerItems(task.assigneeId)
                  : projectPickerItems(task.projectId)
          }
          onClose={() => setPicker(null)}
          onSelect={(id) => {
            if (picker === 'status') onUpdate(task.id, { status: id as Status });
            if (picker === 'priority')
              onUpdate(task.id, { priority: id === '__none__' ? null : (id as Priority) });
            if (picker === 'assignee')
              onUpdate(task.id, { assigneeId: id === '__none__' ? null : id });
            if (picker === 'project') onUpdate(task.id, { projectId: id === '__none__' ? null : id });
          }}
        />
      ) : null}
    </div>
  );
}
