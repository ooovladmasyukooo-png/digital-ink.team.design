import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import type { Sprint } from '../sprints';
import styles from '../tasks.module.css';
import type { Task, TaskPatch, TaskSubtask } from '../types';
import type { SprintPatch } from '../sprintsStore';
import { SprintRow } from './SprintRow';
import { TaskColumnsHeader } from './TaskColumnsHeader';
import { TaskListTree } from './TaskListTree';

interface TaskSprintGroupSectionProps {
  sprint: Sprint;
  tasks: Task[];
  armedDeleteId: string | null;
  onArmDelete: (id: string | null) => void;
  onDeleteSprint: (id: string) => void;
  expandedTreeKeys: ReadonlySet<string>;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  onAdd: (sprintId: string) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
  onSprintUpdate: (sprintId: string, patch: SprintPatch) => void;
  onOpenSprint: (sprintId: string) => void;
}

export function TaskSprintGroupSection({
  sprint,
  tasks,
  armedDeleteId,
  onArmDelete,
  onDeleteSprint,
  expandedTreeKeys,
  onToggleTreeExpand,
  onDelete,
  onDuplicate,
  onUpdate,
  onUpdateSubtask,
  onAddSubtask,
  onAdd,
  onOpenTask,
  onSprintUpdate,
  onOpenSprint,
}: TaskSprintGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(tasks.length === 0);

  const handleAdd = () => {
    setCollapsed(false);
    onAdd(sprint.id);
  };

  return (
    <section className={styles['ts-sprint-group']} aria-label={sprint.title}>
      <SprintRow
        sprint={sprint}
        tasks={tasks}
        armedDeleteId={armedDeleteId}
        onArmDelete={onArmDelete}
        onDelete={onDeleteSprint}
        expanded={!collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onAdd={handleAdd}
        onUpdate={(patch) => onSprintUpdate(sprint.id, patch)}
        onOpen={() => onOpenSprint(sprint.id)}
      />

      {!collapsed ? (
        <div className={styles['ts-sprint-tasks']}>
          <TaskColumnsHeader inGroup variant="personal" />
          {tasks.length > 0 ? (
            <div className={styles['ts-rows']}>
              {tasks.map((task) => (
                <TaskListTree
                  key={task.id}
                  task={task}
                  listVariant="personal"
                  expandedKeys={expandedTreeKeys}
                  onToggleExpand={onToggleTreeExpand}
                  armedDeleteId={armedDeleteId}
                  onArmDelete={onArmDelete}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onUpdateRoot={onUpdate}
                  onUpdateSubtask={onUpdateSubtask}
                  onAddSubtask={onAddSubtask}
                  onOpen={onOpenTask}
                />
              ))}
            </div>
          ) : (
            <p className={styles['ts-group-empty']}>Немає задач</p>
          )}

          <button type="button" className={styles['ts-new-row']} onClick={handleAdd}>
            {Icons.plus}
            <span>Нова задача</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
