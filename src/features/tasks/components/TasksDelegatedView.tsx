import { useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { buildDelegatedGroups } from '../delegatedGroups';
import type { TasksWorkspace } from '../useTasksWorkspace';
import styles from '../tasks.module.css';
import { TaskStatusGroupSection } from './TaskStatusGroupSection';

interface TasksDelegatedViewProps {
  workspace: TasksWorkspace;
}

export function TasksDelegatedView({ workspace }: TasksDelegatedViewProps) {
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
    addTaskForDelegated,
  } = workspace;

  const groups = useMemo(
    () => buildDelegatedGroups(tasks, workspace.viewerId),
    [tasks, workspace.viewerId],
  );

  return (
    <div className={cx(styles['ts-by-date'], styles['ts-delegated'])}>
      <div className={styles['ts-table']}>
        {groups.map((group) => (
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
            onAdd={addTaskForDelegated}
            onOpenTask={openTask}
            listVariant="default"
          />
        ))}
      </div>
    </div>
  );
}
