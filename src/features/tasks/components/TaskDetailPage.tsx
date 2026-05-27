import { useEffect } from 'react';
import { resolveTaskCreatedAt } from '../taskCreatedAt';
import { formatTaskDateTime } from '../dateDisplay';
import { taskDocumentTitle } from '../tasksPaths';
import styles from '../tasks.module.css';
import type { Task, TaskPatch } from '../types';
import { teamById } from '../taskOptions';
import { TaskDetailContent } from './TaskDetailContent';
import { TaskDetailToolbar } from './TaskDetailToolbar';

interface TaskDetailPageProps {
  task: Task;
  taskLinkId: string;
  onClose: () => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onOpenSubtask: (subtaskId: string) => void;
  parentTask?: Pick<Task, 'id' | 'title'>;
  parentTaskLabel?: string;
  onOpenParentTask?: () => void;
}

export function TaskDetailPage({
  task,
  taskLinkId,
  onClose,
  onUpdate,
  onOpenSubtask,
  parentTask,
  parentTaskLabel,
  onOpenParentTask,
}: TaskDetailPageProps) {
  const creator = teamById[task.creatorId];
  const creatorName = creator?.name ?? task.creatorId;
  const createdAtIso = resolveTaskCreatedAt(task);
  const createdAtLabel = formatTaskDateTime(createdAtIso);

  useEffect(() => {
    document.title = taskDocumentTitle(task.title, task.id);
    return () => {
      document.title = 'Задачі · Aurora CRM';
    };
  }, [task.id, task.title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles['ts-detail-page']}>
      <div className={styles['ts-detail-page-main']}>
        <TaskDetailToolbar
          task={task}
          taskLinkId={taskLinkId}
          variant="page"
          onClose={onClose}
          onUpdate={(patch) => onUpdate(task.id, patch)}
          creatorName={creatorName}
          creatorHue={creator?.hue ?? 0}
          createdAtIso={createdAtIso}
          createdAtLabel={createdAtLabel}
        />
        <div className={styles['ts-detail-page-inner']}>
          <TaskDetailContent
            task={task}
            onUpdate={onUpdate}
            onOpenSubtask={onOpenSubtask}
            parentTask={parentTask}
            parentTaskLabel={parentTaskLabel}
            onOpenParentTask={onOpenParentTask}
            scrollClassName={styles['ts-detail-page-scroll']}
            bodyClassName={styles['ts-drawer-body']}
            footerClassName={styles['ts-drawer-footer']}
          />
        </div>
      </div>
    </div>
  );
}
