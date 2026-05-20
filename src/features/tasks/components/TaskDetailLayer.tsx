import type { TasksWorkspace } from '../useTasksWorkspace';
import { TaskDetailPage } from './TaskDetailPage';
import { TaskDetailPanel } from './TaskDetailPanel';

interface TaskDetailLayerProps {
  workspace: TasksWorkspace;
  full: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onClose: () => void;
}

export function TaskDetailLayer({ workspace, full, onExpand, onCollapse, onClose }: TaskDetailLayerProps) {
  const { panelTask, parentLink, subtaskPath, selectedTaskId, updateDetail, setSubtaskPath } = workspace;

  if (!panelTask) return null;

  const taskLinkId = selectedTaskId ?? panelTask.id;

  const parentProps = {
    taskLinkId,
    parentTask: parentLink ?? undefined,
    parentTaskLabel: subtaskPath.length === 1 ? 'Головна задача' : 'Батьківська підзадача',
    onOpenParentTask: parentLink ? () => setSubtaskPath((path) => path.slice(0, -1)) : undefined,
    onOpenSubtask: (subtaskId: string) => setSubtaskPath((path) => [...path, subtaskId]),
    onUpdate: updateDetail,
  };

  if (full) {
    return (
      <TaskDetailPage task={panelTask} onClose={onClose} {...parentProps} />
    );
  }

  return (
    <TaskDetailPanel task={panelTask} onClose={onClose} onExpand={onExpand} {...parentProps} />
  );
}
