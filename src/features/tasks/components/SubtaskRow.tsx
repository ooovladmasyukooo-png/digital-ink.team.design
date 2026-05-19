import { Icons } from '../../../shared/components/Icon';
import { isTaskOverdue } from '../groupTasks';
import type { Subtask, Task, TaskAssignee, TaskPriority, TaskStatus } from '../types';
import type { TasksStateApi } from '../hooks/useTasksState';
import { countSubtasks, resolveSubtaskAssignee, resolveSubtaskPriority, resolveSubtaskStatus } from '../taskTree';
import { useDoubleDelete } from '../hooks/useDoubleDelete';
import { AssigneePicker, DeadlinePicker, PriorityPicker, StatusPicker } from './TaskPickers';
import styles from '../tasks.module.css';

interface SubtaskRowProps {
  task: Task;
  sub: Subtask;
  api: TasksStateApi;
  expanded: boolean;
  onToggleExpand: () => void;
}

export function SubtaskRow({ task, sub, api, expanded, onToggleExpand }: SubtaskRowProps) {
  const status = resolveSubtaskStatus(sub);
  const priority = resolveSubtaskPriority(sub);
  const assignee = resolveSubtaskAssignee(sub, task.assignee);
  const hasChildren = (sub.subtasks?.length ?? 0) > 0;
  const progress = hasChildren ? countSubtasks(sub.subtasks) : null;
  const overdue = sub.deadline ? isTaskOverdue({ ...task, deadline: sub.deadline, status }) : false;
  const isDone = status === 'done';

  const { armedId, onDeleteClick } = useDoubleDelete((id) => api.deleteSubtask(task.id, id));

  return (
    <div className={styles['task-row']} data-sub data-done={isDone ? '' : undefined}>
      <div className={styles['col-status']}>
        <button
          type="button"
          className={styles['sub-chev']}
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-label={expanded ? 'Згорнути' : 'Розгорнути'}
        >
          <span data-open={expanded ? '' : undefined}>{Icons.chevR}</span>
        </button>
        <StatusPicker
          status={status}
          onChange={(s: TaskStatus) => api.updateSubtask(task.id, sub.id, { status: s, done: s === 'done' })}
        />
      </div>
      <div className={styles['col-title']}>
        <span className={styles['sub-title']}>{sub.title}</span>
        {progress && progress.total > 0 ? (
          <span className={styles['sub-progress']}>
            {progress.done}/{progress.total}
          </span>
        ) : null}
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
          className={styles['delete-btn']}
          data-armed={armedId === sub.id ? '' : undefined}
          title={armedId === sub.id ? 'Натисніть ще раз для видалення' : 'Подвійне натискання для видалення'}
          onClick={() => onDeleteClick(sub.id)}
        >
          {Icons.trash}
        </button>
      </div>
    </div>
  );
}
