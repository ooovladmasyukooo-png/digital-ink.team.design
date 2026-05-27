import { TaskRow } from './TaskRow';
import type { ArchiveListItem } from '../types';
import type { TasksWorkspace } from '../useTasksWorkspace';

interface ArchiveListRowProps {
  item: ArchiveListItem;
  workspace: TasksWorkspace;
}

export function ArchiveListRow({ item, workspace }: ArchiveListRowProps) {
  const {
    armedDeleteId,
    setArmedDeleteId,
    deleteTask,
    duplicateTask,
    openTask,
    updateArchiveItem,
  } = workspace;

  return (
    <TaskRow
      variant="archive"
      depth={item.isSubtask ? 1 : 0}
      isSubtask={item.isSubtask}
      parentTaskTitle={item.isSubtask ? item.parentTitle : null}
      title={item.title}
      description={item.description}
      checkItems={item.checkItems}
      status={item.status}
      priority={item.priority}
      tagIds={item.tagIds}
      customTags={item.customTags}
      deadline={item.deadline}
      completedAt={item.completedAt}
      assigneeIds={item.assigneeIds}
      projectId={item.projectId}
      childCount={0}
      hasChildren={false}
      expanded={false}
      onToggleExpand={() => {}}
      onOpen={() => openTask(item.rootTaskId, item.subtaskPath)}
      onUpdate={(patch) => updateArchiveItem(item.rootTaskId, item.subtaskPath, patch)}
      armedDeleteId={armedDeleteId}
      onArmDelete={setArmedDeleteId}
      onDelete={deleteTask}
      onDuplicate={duplicateTask}
      deleteTaskId={item.rowKey}
      duplicateTaskId={item.rowKey}
    />
  );
}
