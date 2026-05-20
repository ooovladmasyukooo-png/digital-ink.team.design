import { useCallback, useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { TaskStatusGroupSection } from '../../tasks/components/TaskStatusGroupSection';
import { buildMemberAssigneeGroups } from '../../tasks/memberAssigneeGroups';
import taskStyles from '../../tasks/tasks.module.css';
import { useTasksWorkspace } from '../../tasks/useTasksWorkspace';
import type { Status } from '../../tasks/types';

interface TeamMemberTasksTabProps {
  memberId: string;
  onOpenTask: (taskId: string) => void;
}

export function TeamMemberTasksTab({ memberId, onOpenTask }: TeamMemberTasksTabProps) {
  const workspace = useTasksWorkspace();
  const {
    tasks,
    armedDeleteId,
    expandedTreeKeys,
    setArmedDeleteId,
    toggleTreeExpand,
    updateTask,
    updateSubtaskAtPath,
    addSubtaskAtPath,
    deleteTask,
    addTaskForMember,
  } = workspace;

  const groups = useMemo(() => buildMemberAssigneeGroups(tasks, memberId), [tasks, memberId]);

  const onAdd = useCallback((status: Status) => addTaskForMember(memberId, status), [addTaskForMember, memberId]);

  const openTask = useCallback(
    (taskId: string, subtaskPath?: string[]) => {
      void subtaskPath;
      onOpenTask(taskId);
    },
    [onOpenTask],
  );

  return (
    <div className={cx(taskStyles['ts-by-date'], taskStyles['ts-delegated'])}>
      <div className={taskStyles['ts-table']}>
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
            onUpdate={updateTask}
            onUpdateSubtask={updateSubtaskAtPath}
            onAddSubtask={addSubtaskAtPath}
            onAdd={onAdd}
            onOpenTask={openTask}
            listVariant={group.status === 'done' ? 'withCompleted' : 'default'}
          />
        ))}
      </div>
    </div>
  );
}
