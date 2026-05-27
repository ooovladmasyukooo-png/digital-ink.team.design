import { useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { buildPersonalGroups } from '../personalGroups';
import type { TasksWorkspace } from '../useTasksWorkspace';
import styles from '../tasks.module.css';
import { TaskStatusGroupSection } from './TaskStatusGroupSection';

interface TasksPersonalViewProps {
  workspace: TasksWorkspace;
}

export function TasksPersonalView({ workspace }: TasksPersonalViewProps) {
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
    addTaskForPersonal,
  } = workspace;

  const groups = useMemo(
    () => buildPersonalGroups(tasks, workspace.viewerId, workspace.sortField),
    [tasks, workspace.viewerId, workspace.sortField],
  );

  return (
    <div className={cx(styles['ts-by-date'], styles['ts-personal'])}>
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
            onAdd={addTaskForPersonal}
            onOpenTask={openTask}
            listVariant="personal"
          />
        ))}
      </div>
    </div>
  );
}
