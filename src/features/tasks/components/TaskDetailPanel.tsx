import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatTaskDateTime } from '../dateDisplay';
import { resolveTaskCreatedAt } from '../taskCreatedAt';
import styles from '../tasks.module.css';
import type { Task, TaskPatch } from '../types';
import { teamById } from '../taskOptions';
import { TaskDetailContent } from './TaskDetailContent';
import { TaskDetailToolbar } from './TaskDetailToolbar';

interface TaskDetailPanelProps {
  task: Task;
  taskLinkId: string;
  onClose: () => void;
  onExpand: () => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onOpenSubtask: (subtaskId: string) => void;
  parentTask?: Pick<Task, 'id' | 'title'>;
  parentTaskLabel?: string;
  onOpenParentTask?: () => void;
}

export function TaskDetailPanel({
  task,
  taskLinkId,
  onClose,
  onExpand,
  onUpdate,
  onOpenSubtask,
  parentTask,
  parentTaskLabel,
  onOpenParentTask,
}: TaskDetailPanelProps) {
  const creator = teamById[task.creatorId];
  const creatorName = creator?.name ?? task.creatorId;
  const createdAtIso = resolveTaskCreatedAt(task);
  const createdAtLabel = formatTaskDateTime(createdAtIso);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <>
      <button type="button" className={styles['ts-drawer-backdrop']} aria-label="Закрити картку задачі" onClick={onClose} />
      <aside className={styles['ts-drawer']} role="dialog" aria-modal="true" aria-label={task.title}>
        <TaskDetailToolbar
          task={task}
          taskLinkId={taskLinkId}
          variant="drawer"
          onClose={onClose}
          onExpand={onExpand}
          onUpdate={(patch) => onUpdate(task.id, patch)}
          creatorName={creatorName}
          creatorHue={creator?.hue ?? 0}
          createdAtIso={createdAtIso}
          createdAtLabel={createdAtLabel}
        />
        <TaskDetailContent
          task={task}
          onUpdate={onUpdate}
          onOpenSubtask={onOpenSubtask}
          parentTask={parentTask}
          parentTaskLabel={parentTaskLabel}
          onOpenParentTask={onOpenParentTask}
        />
      </aside>
    </>,
    document.body,
  );
}
