import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import type { SprintPhaseGroup } from '../sprintGroups';
import styles from '../tasks.module.css';
import type { TaskPatch, TaskSubtask } from '../types';
import type { SprintPhaseId } from '../types';
import type { SprintPatch } from '../sprintsStore';
import { SprintColumnsHeader } from './SprintColumnsHeader';
import { TaskSprintGroupSection } from './TaskSprintGroupSection';

interface SprintPhaseSectionProps {
  phase: SprintPhaseId;
  label: string;
  sprints: SprintPhaseGroup['sprints'];
  taskCount: number;
  armedDeleteId: string | null;
  expandedTreeKeys: ReadonlySet<string>;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  onAdd: (sprintId: string) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
  onSprintUpdate: (sprintId: string, patch: SprintPatch) => void;
  onDeleteSprint: (sprintId: string) => void;
  onOpenSprint: (sprintId: string) => void;
}

const PHASE_TONE_CLASS: Record<SprintPhaseId, string | undefined> = {
  active: styles['ts-group-status-blue'],
  queued: styles['ts-group-status-gray'],
  completed: styles['ts-group-status-green'],
};

export function SprintPhaseSection({
  phase,
  label,
  sprints,
  taskCount,
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
  onSprintUpdate,
  onDeleteSprint,
  onOpenSprint,
}: SprintPhaseSectionProps) {
  const [collapsed, setCollapsed] = useState(taskCount === 0);
  const toneClass = PHASE_TONE_CLASS[phase];

  return (
    <section
      className={cx(
        styles['ts-group'],
        styles['ts-group-status'],
        styles['ts-group-sprint-phase'],
        toneClass,
      )}
      aria-label={label}
    >
      <div className={styles['ts-group-head']}>
        <button
          type="button"
          className={styles['ts-group-toggle']}
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          <span className={cx(styles['ts-chev'], collapsed && styles['ts-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['ts-group-title']}>{label}</span>
        </button>
        <span className={styles['ts-group-count']}>{taskCount}</span>
      </div>

      {!collapsed ? (
        <div className={styles['ts-sprint-phase-body']}>
          {sprints.length > 0 ? <SprintColumnsHeader inGroup /> : null}
          {sprints.map((group) => (
            <TaskSprintGroupSection
              key={group.sprint.id}
              sprint={group.sprint}
              tasks={group.tasks}
              armedDeleteId={armedDeleteId}
              expandedTreeKeys={expandedTreeKeys}
              onToggleTreeExpand={onToggleTreeExpand}
              onArmDelete={onArmDelete}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onUpdate={onUpdate}
              onUpdateSubtask={onUpdateSubtask}
              onAddSubtask={onAddSubtask}
              onAdd={onAdd}
              onOpenTask={onOpenTask}
              onSprintUpdate={onSprintUpdate}
              onDeleteSprint={onDeleteSprint}
              onOpenSprint={onOpenSprint}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
