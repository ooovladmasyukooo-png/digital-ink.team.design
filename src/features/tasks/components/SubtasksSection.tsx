import { useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { PRIORITIES, STATUS_META } from '../constants';
import { isoToDisplayDate } from '../dateDisplay';
import { createNewSubtask, isSubtaskDone } from '../subtaskTask';
import styles from '../tasks.module.css';
import type { Priority, Status, TaskSubtask } from '../types';
import {
  AssigneeCell,
  assigneePickerClearOption,
  assigneePickerItems,
  priorityPickerItems,
  statusPickerItems,
  SubtaskStatusIcon,
  toggleAssigneeIds,
} from '../taskOptions';
import { TaskDeadlinePicker } from './TaskDeadlinePicker';
import { TaskPickerPopover } from './TaskPickerPopover';

type SubtaskPickerField = 'status' | 'priority' | 'assignee' | 'deadline';
type SubtaskPicker = { subtaskId: string; field: SubtaskPickerField } | null;

interface SubtasksSectionProps {
  subtasks: TaskSubtask[];
  rootProjectId: string | null;
  onChange: (subtasks: TaskSubtask[]) => void;
  onOpenSubtask: (subtaskId: string) => void;
}

export function SubtasksSection({ subtasks, rootProjectId, onChange, onOpenSubtask }: SubtasksSectionProps) {
  const [picker, setPicker] = useState<SubtaskPicker>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const done = subtasks.filter((s) => isSubtaskDone(s)).length;
  const hasSubtasks = subtasks.length > 0;
  const active = picker ? subtasks.find((s) => s.id === picker.subtaskId) : null;

  const updateOne = (id: string, patch: Partial<TaskSubtask>) => {
    onChange(subtasks.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const openPicker = (subtaskId: string, field: SubtaskPickerField, el: HTMLButtonElement) => {
    anchorRef.current = el;
    setPicker({ subtaskId, field });
  };

  const addSubtask = () => {
    onChange([...subtasks, createNewSubtask(rootProjectId)]);
  };

  const head = (
    <div className={styles['ts-drawer-block-head']}>
      <h3 className={styles['ts-drawer-block-title']}>Підзадачі</h3>
      {hasSubtasks ? <span className={styles['ts-drawer-block-meta']}>{done}/{subtasks.length}</span> : null}
    </div>
  );

  if (!hasSubtasks) {
    return (
      <button
        type="button"
        className={cx(
          styles['ts-drawer-block'],
          styles['ts-drawer-block-subtasks'],
          styles['ts-drawer-block-subtasks-empty'],
          styles['ts-drawer-block-empty-hit'],
        )}
        onClick={addSubtask}
        aria-label="Додати підзадачу"
      >
        <span className={styles['ts-drawer-empty-t']}>
          {Icons.plus}
          Додати підзадачу
        </span>
      </button>
    );
  }

  return (
    <section className={cx(styles['ts-drawer-block'], styles['ts-drawer-block-subtasks'])}>
      {head}
      <div className={styles['ts-drawer-block-body']}>
        <div
          className={styles['ts-subtasks-progress']}
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={subtasks.length}
        >
          <span
            className={styles['ts-subtasks-progress-bar']}
            style={{ width: `${(done / subtasks.length) * 100}%` }}
          />
        </div>
        <ul className={styles['ts-subtask-list']}>
          {subtasks.map((subtask) => (
            <li key={subtask.id} className={styles['ts-subtask-row']}>
              <button
                type="button"
                className={styles['ts-subtask-status-btn']}
                aria-label={`Статус: ${STATUS_META[subtask.status].label}`}
                onClick={(e) => openPicker(subtask.id, 'status', e.currentTarget)}
              >
                <SubtaskStatusIcon status={subtask.status} />
              </button>
              <input
                className={cx(styles['ts-subtask-title'], isSubtaskDone(subtask) && styles['ts-check-label-done'])}
                value={subtask.title}
                onChange={(e) => updateOne(subtask.id, { title: e.target.value })}
                aria-label="Назва підзадачі"
              />
              <div className={styles['ts-subtask-meta']}>
                <button
                  type="button"
                  className={styles['ts-subtask-open']}
                  aria-label="Відкрити підзадачу"
                  onClick={() => onOpenSubtask(subtask.id)}
                >
                  {Icons.openExternal}
                </button>
                <button
                  type="button"
                  className={cx(
                    styles['ts-subtask-meta-btn'],
                    subtask.priority && styles[`ts-subtask-pri-${subtask.priority}`],
                  )}
                  aria-label={
                    subtask.priority
                      ? `Пріоритет: ${PRIORITIES[subtask.priority].label}`
                      : 'Пріоритет не встановлено'
                  }
                  onClick={(e) => openPicker(subtask.id, 'priority', e.currentTarget)}
                >
                  {Icons.flag}
                </button>
                <button
                  type="button"
                  className={styles['ts-subtask-meta-btn']}
                  aria-label="Відповідальний"
                  onClick={(e) => openPicker(subtask.id, 'assignee', e.currentTarget)}
                >
                  {subtask.assigneeIds.length > 0 ? (
                    <AssigneeCell assigneeIds={subtask.assigneeIds} />
                  ) : (
                    <span className={styles['ts-subtask-meta-ph']} aria-hidden>
                      {Icons.team}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={cx(styles['ts-subtask-meta-btn'], styles['ts-subtask-meta-btn-deadline'])}
                  aria-label="Дедлайн"
                  onClick={(e) => openPicker(subtask.id, 'deadline', e.currentTarget)}
                >
                  {subtask.deadline ? (
                    <span className={styles['ts-subtask-deadline-t']}>{isoToDisplayDate(subtask.deadline)}</span>
                  ) : (
                    <span className={styles['ts-subtask-meta-ph']} aria-hidden>
                      {Icons.calendar}
                    </span>
                  )}
                </button>
              </div>
              <button
                type="button"
                className={styles['ts-subtask-del']}
                aria-label="Видалити підзадачу"
                onClick={() => onChange(subtasks.filter((s) => s.id !== subtask.id))}
              >
                {Icons.trash}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles['ts-detail-add']} onClick={addSubtask}>
          {Icons.plus}
          <span>Додати підзадачу</span>
        </button>
      </div>

      {picker && active ? (
        picker.field === 'deadline' ? (
          <TaskDeadlinePicker
            open
            anchorRef={anchorRef}
            valueIso={active.deadline}
            onClose={() => setPicker(null)}
            onSelectIso={(iso) => {
              updateOne(active.id, { deadline: iso });
              setPicker(null);
            }}
          />
        ) : (
          <TaskPickerPopover
            open
            anchorRef={anchorRef}
            searchable={picker.field === 'assignee'}
            width={picker.field === 'assignee' ? 280 : picker.field === 'status' ? 220 : 200}
            compact={picker.field === 'status'}
            multiSelect={picker.field === 'assignee'}
            clearOption={
              picker.field === 'priority'
                ? {
                    id: '__none__',
                    label: 'Clear',
                    selected: active.priority === null,
                  }
                : picker.field === 'assignee'
                  ? assigneePickerClearOption(active.assigneeIds)
                  : undefined
            }
            items={
              picker.field === 'status'
                ? statusPickerItems(active.status)
                : picker.field === 'priority'
                  ? priorityPickerItems(active.priority)
                  : assigneePickerItems(active.assigneeIds)
            }
            onClose={() => setPicker(null)}
            onSelect={(id) => {
              if (picker.field === 'status') {
                updateOne(active.id, { status: id as Status });
              }
              if (picker.field === 'priority') {
                updateOne(active.id, { priority: id === '__none__' ? null : (id as Priority) });
              }
              if (picker.field === 'assignee') {
                updateOne(active.id, { assigneeIds: toggleAssigneeIds(active.assigneeIds, id) });
              }
              setPicker(null);
            }}
          />
        )
      ) : null}
    </section>
  );
}
