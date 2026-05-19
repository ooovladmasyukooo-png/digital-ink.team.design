import { Icons } from '../../../shared/components/Icon';
import type { DateGroupId } from '../groupTasks';
import type { Task } from '../types';
import type { TasksStateApi } from '../hooks/useTasksState';
import { TaskComposerRow } from './TaskComposerRow';
import { TaskRow } from './TaskRow';
import styles from '../tasks.module.css';

interface TaskGroupProps {
  id: DateGroupId;
  label: string;
  meta?: string;
  tasks: Task[];
  expanded: boolean;
  onToggle: () => void;
  api: TasksStateApi;
  draftTaskId: string | null;
  onStartCompose: () => void;
  onComposeClose: () => void;
}

export function TaskGroup({
  id,
  label,
  meta,
  tasks,
  expanded,
  onToggle,
  api,
  draftTaskId,
  onStartCompose,
  onComposeClose,
}: TaskGroupProps) {
  const savedTasks = tasks.filter((t) => !t.isDraft && t.id !== draftTaskId);
  const draftTask = draftTaskId ? tasks.find((t) => t.id === draftTaskId) : undefined;
  const count = savedTasks.length;

  return (
    <section className={styles['group']} data-group={id}>
      <button type="button" className={styles['group-head']} onClick={onToggle} aria-expanded={expanded}>
        <span className={styles['group-chev']} data-open={expanded ? '' : undefined}>
          {Icons.chevD}
        </span>
        <span className={styles['group-label']} data-group={id}>
          {label}
        </span>
        {meta ? <span className={styles['group-meta']}>{meta}</span> : null}
        <span className={styles['group-count']} data-group={id}>
          {count}
        </span>
      </button>

      {expanded ? (
        <div className={styles['group-body']}>
          <div className={styles['table-head']} aria-hidden>
            <span className={styles['col-status']} />
            <span>Назва</span>
            <span>Пріоритет</span>
            <span>Термін</span>
            <span>Викон.</span>
            <span>Напрямок</span>
            <span className={styles['col-delete']} />
          </div>

          <div className={styles['group-tasks']}>
            {savedTasks.map((task) => (
              <TaskRow key={task.id} task={task} api={api} />
            ))}
            {draftTask ? <TaskComposerRow task={draftTask} api={api} onClose={onComposeClose} /> : null}
          </div>

          {!draftTask ? (
            <button type="button" className={styles['add-task']} onClick={onStartCompose}>
              {Icons.plus}
              <span>Додати задачу</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
