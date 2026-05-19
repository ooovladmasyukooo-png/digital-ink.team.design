import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../../../shared/components/Icon';
import { isTaskOverdue } from '../groupTasks';
import type { Subtask, Task, TaskAssignee, TaskPriority, TaskStatus } from '../types';
import type { TasksStateApi } from '../hooks/useTasksState';
import { resolveSubtaskAssignee, resolveSubtaskPriority, resolveSubtaskStatus } from '../taskTree';
import { AssigneePicker, DeadlinePicker, PriorityPicker, StatusPicker } from './TaskPickers';
import styles from '../tasks.module.css';

interface SubtaskComposerRowProps {
  task: Task;
  sub: Subtask;
  api: TasksStateApi;
  onClose: () => void;
}

export function SubtaskComposerRow({ task, sub, api, onClose }: SubtaskComposerRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(sub.title);
  const status = resolveSubtaskStatus(sub);
  const priority = resolveSubtaskPriority(sub);
  const assignee = resolveSubtaskAssignee(sub, task.assignee);
  const overdue = sub.deadline ? isTaskOverdue({ ...task, deadline: sub.deadline, status }) : false;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const finish = useCallback(
    (save: boolean) => {
      if (save) {
        const ok = api.commitDraftSubtask(task.id, sub.id, title);
        if (!ok) onClose();
      } else {
        api.cancelDraftSubtask(task.id, sub.id);
        onClose();
      }
    },
    [api, onClose, sub.id, task.id, title],
  );

  const handleBlur = () => {
    requestAnimationFrame(() => {
      if (rootRef.current?.contains(document.activeElement)) return;
      finish(true);
    });
  };

  return (
    <div ref={rootRef} className={styles['composer-sub']} onBlur={handleBlur}>
      <div className={styles['task-row']} data-sub data-composer>
        <div className={styles['col-status']}>
          <span className={styles['sub-chev-spacer']} />
          <StatusPicker
            status={status}
            onChange={(s: TaskStatus) => api.updateSubtask(task.id, sub.id, { status: s, done: s === 'done' })}
          />
        </div>
        <div className={styles['col-title']}>
          <input
            ref={inputRef}
            type="text"
            className={styles['composer-input']}
            placeholder="Назва підзадачі"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finish(true);
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                finish(false);
              }
            }}
          />
        </div>
        <div className={styles['col-priority']}>
          <PriorityPicker
            priority={priority}
            onChange={(p: TaskPriority) => api.updateSubtask(task.id, sub.id, { priority: p })}
          />
        </div>
        <div className={styles['col-deadline']}>
          <DeadlinePicker
            deadline={sub.deadline ?? null}
            overdue={overdue}
            onChange={(d) => api.updateSubtask(task.id, sub.id, { deadline: d })}
          />
        </div>
        <div className={styles['col-assignee']}>
          <AssigneePicker
            assignee={assignee}
            onChange={(a: TaskAssignee) => api.updateSubtask(task.id, sub.id, { assignee: a, assigneeId: a.id })}
          />
        </div>
        <div className={styles['col-direction']} />
        <div className={styles['col-delete']}>
          <button
            type="button"
            className={styles['composer-cancel']}
            title="Скасувати"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => finish(false)}
          >
            <Icon d={<path d="M18 6 6 18M6 6l12 12" />} size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
