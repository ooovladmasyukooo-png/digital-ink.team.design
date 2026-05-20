import { useCallback, useEffect, useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { TaskDetailLayer } from '../../tasks/components/TaskDetailLayer';
import { TaskStatusGroupSection } from '../../tasks/components/TaskStatusGroupSection';
import { buildMemberAssigneeGroups } from '../../tasks/memberAssigneeGroups';
import taskStyles from '../../tasks/tasks.module.css';
import { useTasksWorkspace } from '../../tasks/useTasksWorkspace';
import type { Status } from '../../tasks/types';

interface TeamMemberTasksTabProps {
  memberId: string;
  /** Відкрити задачу на повній сторінці (кнопка «розкрити» в drawer). */
  onOpenTaskFullPage: (taskId: string) => void;
}

export function TeamMemberTasksTab({ memberId, onOpenTaskFullPage }: TeamMemberTasksTabProps) {
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
    addTaskForMember,
    selectedTaskId,
  } = workspace;

  const groups = useMemo(() => buildMemberAssigneeGroups(tasks, memberId), [tasks, memberId]);

  useEffect(() => {
    closeDetail();
  }, [memberId, closeDetail]);

  const onAdd = useCallback((status: Status) => addTaskForMember(memberId, status), [addTaskForMember, memberId]);

  const expandTask = useCallback(() => {
    const id = selectedTaskId ?? workspace.panelTask?.id;
    if (!id) return;
    onOpenTaskFullPage(id);
  }, [onOpenTaskFullPage, selectedTaskId, workspace.panelTask?.id]);

  return (
    <>
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
