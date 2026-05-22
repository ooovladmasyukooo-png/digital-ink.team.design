import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { Avatar } from '../../../shared/components/Avatar';
import { cx } from '../../../shared/styles/cx';
import { projectById } from '../taskOptions';
import styles from '../tasks.module.css';
import type { Task, TaskPatch, TaskSubtask } from '../types';
import { TaskColumnsHeader } from './TaskColumnsHeader';
import { TaskListTree } from './TaskListTree';

interface TaskProjectGroupSectionProps {
  projectId: string | null;
  label: string;
  fullLabel: string;
  tasks: Task[];
  armedDeleteId: string | null;
  expandedTreeKeys: ReadonlySet<string>;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  onAdd: (projectId: string | null) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
}

export function TaskProjectGroupSection({
  projectId,
  label,
  fullLabel,
  tasks,
  armedDeleteId,
  expandedTreeKeys,
  onToggleTreeExpand,
  onArmDelete,
  onDelete,
  onDuplicate,
  onUpdate,
  onUpdateSubtask,
  onAddSubtask,
  onAdd,
  onOpenTask,
}: TaskProjectGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const project = projectId ? projectById[projectId] : null;

  if (tasks.length === 0) return null;

  return (
    <section
      className={cx(styles['ts-group'], styles['ts-group-project'])}
      aria-label={fullLabel}
    >
      <div className={styles['ts-group-head']}>
        <button
          type="button"
          className={styles['ts-group-toggle']}
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          title={fullLabel}
        >
          <span className={cx(styles['ts-chev'], collapsed && styles['ts-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['ts-group-project-title']}>
            {project ? (
              <span className={styles['ts-group-project-av']}>
                <Avatar name={project.name} hue={project.hue} size="sm" />
              </span>
            ) : (
              <span className={styles['ts-group-project-ph']} aria-hidden>
                {Icons.briefcase}
              </span>
            )}
            <span className={styles['ts-group-project-name']}>{label}</span>
          </span>
        </button>
        <span className={styles['ts-group-count']}>{tasks.length}</span>
        <button
          type="button"
          className={styles['ts-group-add']}
          aria-label={`Нова задача: ${label}`}
          onClick={() => onAdd(projectId)}
        >
          {Icons.plus}
        </button>
      </div>

      {!collapsed ? (
        <>
          <TaskColumnsHeader inGroup />
          <div className={styles['ts-rows']}>
            {tasks.map((task) => (
              <TaskListTree
                key={task.id}
                task={task}
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

          <button
            type="button"
            className={styles['ts-new-row']}
            onClick={() => onAdd(projectId)}
          >
            {Icons.plus}
            <span>Нова задача</span>
          </button>
        </>
      ) : null}
    </section>
  );
}
