import { useCallback, useEffect, useMemo, useState } from 'react';
import { cx } from '../../../shared/styles/cx';
import { ProjectTasksListToolbar } from '../components/ProjectTasksListToolbar';
import { TaskDetailLayer } from '../../tasks/components/TaskDetailLayer';
import { TaskStatusGroupSection } from '../../tasks/components/TaskStatusGroupSection';
import {
  buildProjectStatusGroups,
  collectProjectAssigneeIds,
} from '../../tasks/projectStatusGroups';
import { readProjectTasksSort, writeProjectTasksSort } from '../../tasks/projectTaskSort';
import taskStyles from '../../tasks/tasks.module.css';
import { useTasksWorkspace } from '../../tasks/useTasksWorkspace';
import type { Status, TasksSortField } from '../../tasks/types';

interface ProjectTasksTabProps {
  projectId: string;
  onOpenTaskFullPage: (taskId: string) => void;
}

export function ProjectTasksTab({ projectId, onOpenTaskFullPage }: ProjectTasksTabProps) {
  const [sortField, setSortField] = useState<TasksSortField>(() => readProjectTasksSort());
  const [assigneeFilterId, setAssigneeFilterId] = useState<string | null>(null);
  const workspace = useTasksWorkspace();
  const {
    tasks,
    armedDeleteId,
    expandedTreeKeys,
    setArmedDeleteId,
    toggleTreeExpand,
    openTask,
    closeDetail,
    updateTask,
    updateSubtaskAtPath,
    addSubtaskAtPath,
    deleteTask,
    duplicateTask,
    addTaskForProjectStatus,
    selectedTaskId,
  } = workspace;

  const assigneeIds = useMemo(() => collectProjectAssigneeIds(tasks, projectId), [tasks, projectId]);

  const groups = useMemo(
    () => buildProjectStatusGroups(tasks, projectId, sortField, assigneeFilterId),
    [tasks, projectId, sortField, assigneeFilterId],
  );

  useEffect(() => {
    closeDetail();
    setAssigneeFilterId(null);
  }, [projectId, closeDetail]);

  useEffect(() => {
    if (assigneeFilterId && !assigneeIds.includes(assigneeFilterId)) {
      setAssigneeFilterId(null);
    }
  }, [assigneeFilterId, assigneeIds]);

  const onSortChange = useCallback((field: TasksSortField) => {
    setSortField(field);
    writeProjectTasksSort(field);
  }, []);

  const onAdd = useCallback(
    (status: Status) => addTaskForProjectStatus(projectId, status),
    [addTaskForProjectStatus, projectId],
  );

  const expandTask = useCallback(() => {
    const id = selectedTaskId ?? workspace.panelTask?.id;
    if (!id) return;
    onOpenTaskFullPage(id);
  }, [onOpenTaskFullPage, selectedTaskId, workspace.panelTask?.id]);

  return (
    <>
      <div className={cx(taskStyles['ts-by-date'], taskStyles['ts-personal'], taskStyles['ts-project-tasks'])}>
        <div className={taskStyles['ts-table']}>
          <ProjectTasksListToolbar
            assigneeIds={assigneeIds}
            activeAssigneeId={assigneeFilterId}
            onAssigneeChange={setAssigneeFilterId}
            sortField={sortField}
            onSortChange={onSortChange}
          />
          {groups.length === 0 ? (
            <p className={taskStyles['ts-empty-state']}>
              {assigneeFilterId ? 'Немає задач для обраного відповідального.' : 'Немає задач у цьому проєкті.'}
            </p>
          ) : (
            groups.map((group) => (
              <TaskStatusGroupSection
                key={group.status}
                status={group.status}
                label={group.label}
                tasks={group.tasks}
                armedDeleteId={armedDeleteId}
                expandedTreeKeys={expandedTreeKeys}
                onToggleTreeExpand={toggleTreeExpand}
                onArmDelete={setArmedDeleteId}
                onDelete={deleteTask}
                onDuplicate={duplicateTask}
                onUpdate={updateTask}
                onUpdateSubtask={updateSubtaskAtPath}
                onAddSubtask={addSubtaskAtPath}
                onAdd={onAdd}
                onOpenTask={openTask}
                listVariant={group.status === 'done' ? 'withCompleted' : 'personal'}
              />
            ))
          )}
        </div>
      </div>
      <TaskDetailLayer
        workspace={workspace}
        full={false}
        onExpand={expandTask}
        onCollapse={closeDetail}
        onClose={closeDetail}
      />
    </>
  );
}
