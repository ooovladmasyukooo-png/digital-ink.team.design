import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../../../shared/components/Icon';
import { isTaskOverdue } from '../groupTasks';
import type { Task } from '../types';
import type { TasksStateApi } from '../hooks/useTasksState';
import {
  AssigneePicker,
  DeadlinePicker,
  DirectionPicker,
  PriorityPicker,
  StatusPicker,
} from './TaskPickers';
import styles from '../tasks.module.css';

interface TaskComposerRowProps {
  task: Task;
  api: TasksStateApi;
  onClose: () => void;
}

export function TaskComposerRow({ task, api, onClose }: TaskComposerRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [showDesc, setShowDesc] = useState(Boolean(task.description));
  const overdue = isTaskOverdue(task);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const finish = useCallback(
    (save: boolean) => {
      if (save) {
        const ok = api.commitDraftTask(task.id, { title, description });
        if (!ok) onClose();
      } else {
        api.cancelDraftTask(task.id);
        onClose();
      }
    },
    [api, description, onClose, task.id, title],
  );

  const handleBlur = () => {
    requestAnimationFrame(() => {
      if (rootRef.current?.contains(document.activeElement)) return;
      finish(true);
    });
  };

  return (
    <div ref={rootRef} className={styles['composer-block']} onBlur={handleBlur}>
      <div className={styles['task-row']} data-composer>
        <div className={styles['col-status']}>
          <span className={styles['sub-chev-spacer']} />
          <StatusPicker status={task.status} onChange={(s) => api.setTaskStatus(task.id, s)} />
        </div>
        <div className={styles['col-title']}>
          <input
            ref={inputRef}
            type="text"
            className={styles['composer-input']}
            placeholder="Назва задачі"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setShowDesc(true)}
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
            priority={task.priority}
            onChange={(p) => api.setTaskPriority(task.id, p)}
          />
        </div>
        <div className={styles['col-deadline']}>
          <DeadlinePicker
            deadline={task.deadline}
            overdue={overdue}
            onChange={(d) => api.setTaskDeadline(task.id, d)}
          />
        </div>
        <div className={styles['col-assignee']}>
          <AssigneePicker assignee={task.assignee} onChange={(a) => api.setTaskAssignee(task.id, a)} />
        </div>
        <div className={styles['col-direction']}>
          <DirectionPicker
            projectId={task.projectId}
            projectName={task.projectName}
            onChange={(id, name) => api.setTaskDirection(task.id, id, name)}
          />
        </div>
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
      {showDesc ? (
        <textarea
          className={styles['composer-desc']}
          placeholder="Опис (необовʼязково)"
          value={description}
          rows={2}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              finish(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
