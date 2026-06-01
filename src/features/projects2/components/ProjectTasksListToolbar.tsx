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
}

/** Компактні фільтри справа: пріоритет/сортування та відповідальний. */
export function ProjectTasksListToolbar({
  assigneeIds,
  activeAssigneeId,
  onAssigneeChange,
  sortField,
  onSortChange,
}: ProjectTasksListToolbarProps) {
  return (
    <div className={taskStyles['ts-project-filters']} aria-label="Фільтри списку задач">
      <TasksSortSwitcher sortField={sortField} onSortChange={onSortChange} />
      <ProjectTasksAssigneeSwitcher
        assigneeIds={assigneeIds}
        activeAssigneeId={activeAssigneeId}
        onChange={onAssigneeChange}
      />
    </div>
  );
}
