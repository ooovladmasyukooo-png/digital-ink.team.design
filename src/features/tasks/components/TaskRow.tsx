import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { isTaskOverdue } from '../groupTasks';
import type { Task } from '../types';
import type { TasksStateApi } from '../hooks/useTasksState';
import { countSubtasks } from '../taskTree';
import { useDoubleDelete } from '../hooks/useDoubleDelete';
import { AssigneePicker, DeadlinePicker, DirectionPicker, PriorityPicker, StatusPicker } from './TaskPickers';
import { SubtaskBranch } from './SubtaskBranch';
import styles from '../tasks.module.css';

interface TaskRowProps {
  task: Task;
  api: TasksStateApi;
}

export function TaskRow({ task, api }: TaskRowProps) {
  const savedSubs = task.subtasks.filter((s) => !s.isDraft);
  const hasSubtasks = savedSubs.length > 0;
  const [subExpanded, setSubExpanded] = useState(hasSubtasks);
  const progress = hasSubtasks ? countSubtasks(task.subtasks) : null;
  const overdue = isTaskOverdue(task);
  const isDone = task.status === 'done';
  const { armedId, onDeleteClick } = useDoubleDelete((id) => api.deleteTask(id));

  const toggleSubs = () => {
    if (subExpanded) {
      const draft = task.subtasks.find((s) => s.isDraft);
      if (draft) api.cancelDraftSubtask(task.id, draft.id);
      setSubExpanded(false);
      return;
    }
    setSubExpanded(true);
    if (!task.subtasks.some((s) => s.isDraft)) {
      api.addSubtask(task.id, null, { draft: true });
    }
  };

  return (
    <div
      className={styles['task-block']}
      data-has-subs={hasSubtasks ? '' : undefined}
      data-sub-open={subExpanded ? '' : undefined}
    >
      <div className={styles['task-row']} data-done={isDone ? '' : undefined}>
        <div className={styles['col-status']}>
          <button
            type="button"
            className={styles['sub-chev']}
            onClick={toggleSubs}
            aria-expanded={subExpanded}
            aria-label={subExpanded ? 'Згорнути підзадачі' : 'Розгорнути підзадачі'}
          >
            <span data-open={subExpanded ? '' : undefined}>{Icons.chevR}</span>
          </button>
          <StatusPicker status={task.status} onChange={(s) => api.setTaskStatus(task.id, s)} />
        </div>
        <div className={styles['col-title']}>
          <span className={styles['task-title']}>{task.title}</span>
          {progress && progress.total > 0 ? (
            <span className={styles['sub-progress']}>
              {progress.done}/{progress.total}
            </span>
          ) : null}
        </div>
        <div className={styles['col-priority']}>
          <PriorityPicker priority={task.priority} onChange={(p) => api.setTaskPriority(task.id, p)} />
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
            className={styles['delete-btn']}
            data-armed={armedId === task.id ? '' : undefined}
            title={armedId === task.id ? 'Натисніть ще раз для видалення' : 'Подвійне натискання для видалення'}
            onClick={() => onDeleteClick(task.id)}
          >
            {Icons.trash}
          </button>
        </div>
      </div>

      {subExpanded ? (
        <SubtaskBranch task={task} subs={task.subtasks} parentSubId={null} depth={0} api={api} />
      ) : null}
    </div>
  );
}
