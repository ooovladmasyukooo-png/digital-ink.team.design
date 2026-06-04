import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { TasksSortSwitcher } from '../../tasks/components/TasksSortSwitcher';
import taskStyles from '../../tasks/tasks.module.css';
import type { TasksSortField } from '../../tasks/types';
import { ProjectTasksAssigneeSwitcher } from './ProjectTasksAssigneeSwitcher';

interface ProjectTasksListToolbarProps {
  assigneeIds: string[];
  activeAssigneeId: string | null;
  onAssigneeChange: (assigneeId: string | null) => void;
  sortField: TasksSortField;
  onSortChange: (field: TasksSortField) => void;
  onCreateTask: () => void;
}

/** Компактні фільтри справа: пріоритет/сортування та відповідальний. */
export function ProjectTasksListToolbar({
  assigneeIds,
  activeAssigneeId,
  onAssigneeChange,
  sortField,
  onSortChange,
  onCreateTask,
}: ProjectTasksListToolbarProps) {
  return (
    <div className={taskStyles['ts-project-filters']} aria-label="Дії та фільтри списку задач">
      <div className={taskStyles['ts-project-filters-end']}>
        <TasksSortSwitcher sortField={sortField} onSortChange={onSortChange} />
        <ProjectTasksAssigneeSwitcher
          assigneeIds={assigneeIds}
          activeAssigneeId={activeAssigneeId}
          onChange={onAssigneeChange}
        />
        <button
          type="button"
          className={cx('red-out-btn', taskStyles['ts-project-add'])}
          aria-label="Нова задача"
          onClick={onCreateTask}
        >
          {Icons.plus}
          Нова задача
        </button>
      </div>
    </div>
  );
}
