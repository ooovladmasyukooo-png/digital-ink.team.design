import { useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { buildSprintPhaseGroups } from '../sprintGroups';
import type { TasksWorkspace } from '../useTasksWorkspace';
import styles from '../tasks.module.css';
import { SprintPhaseSection } from './SprintPhaseSection';

interface TasksSprintsViewProps {
  workspace: TasksWorkspace;
}

export function TasksSprintsView({ workspace }: TasksSprintsViewProps) {
  const {
    tasks,
    armedDeleteId,
    expandedTreeKeys,
    setArmedDeleteId,
    toggleTreeExpand,
    openTask,
    updateTask,
    updateSubtaskAtPath,
    addSubtaskAtPath,
    deleteTask,
    duplicateTask,
    addTaskForSprint,
    updateSprintFields,
    deleteSprint,
    openSprint,
  } = workspace;

  const groups = useMemo(
    () => buildSprintPhaseGroups(workspace.sprints, tasks, workspace.viewerId, workspace.sortField),
    [tasks, workspace.sprints, workspace.viewerId, workspace.sortField],
  );

  return (
    <div className={cx(styles['ts-by-date'], styles['ts-sprints'])}>
      <div className={styles['ts-table']}>
        {groups.map((group) => (
          <SprintPhaseSection
            key={group.phase}
            phase={group.phase}
            label={group.label}
            sprints={group.sprints}
            taskCount={group.taskCount}
            armedDeleteId={armedDeleteId}
            expandedTreeKeys={expandedTreeKeys}
            onToggleTreeExpand={toggleTreeExpand}
            onArmDelete={setArmedDeleteId}
            onDelete={deleteTask}
            onDuplicate={duplicateTask}
            onUpdate={updateTask}
            onUpdateSubtask={updateSubtaskAtPath}
            onAddSubtask={addSubtaskAtPath}
            onAdd={addTaskForSprint}
            onOpenTask={openTask}
            onSprintUpdate={updateSprintFields}
            onDeleteSprint={deleteSprint}
            onOpenSprint={openSprint}
          />
        ))}
      </div>
    </div>
  );
}
