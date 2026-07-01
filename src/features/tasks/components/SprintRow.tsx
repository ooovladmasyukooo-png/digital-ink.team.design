import { useMemo, useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { PRIORITIES } from '../constants';
import { getSprintTaskProgress } from '../sprintProgress';
import {
  formatSprintDurationDays,
  formatSprintDurationDaysShort,
  formatSprintTermDate,
  getSprintDurationDays,
  getSprintPhase,
  SPRINT_PHASE_BADGE_LABELS,
} from '../sprints';
import type { SprintPatch } from '../sprintsStore';
import { sprintPhasePickerItems } from '../sprintOptions';
import type { Sprint } from '../sprints';
import styles from '../tasks.module.css';
import type { Priority, SprintPhaseId, Task } from '../types';
import {
  AssigneeCell,
  PriorityBadge,
  assigneePickerClearOption,
  assigneePickerItems,
  priorityPickerItems,
  toggleAssigneeIds,
} from '../taskOptions';
import { SprintPhaseBadge } from './SprintPhaseBadge';
import { SprintProgressBar } from './SprintProgressBar';
import { TaskDeadlinePicker } from './TaskDeadlinePicker';
import { TaskDeleteButton } from './TaskDeleteButton';
import { TaskPickerPopover } from './TaskPickerPopover';

type SprintPickerField = 'status' | 'priority' | 'assignee' | 'start' | 'end' | null;

function toDateOnly(iso: string | null): string | null {
  if (!iso) return null;
  return iso.split('T')[0] ?? null;
}

interface SprintRowProps {
  sprint: Sprint;
  tasks: Task[];
  expanded: boolean;
  armedDeleteId: string | null;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onToggle: () => void;
  onAdd: () => void;
  onUpdate: (patch: SprintPatch) => void;
  onOpen: () => void;
}

export function SprintRow({
  sprint,
  tasks,
  expanded,
  armedDeleteId,
  onArmDelete,
  onDelete,
  onToggle,
  onAdd,
  onUpdate,
  onOpen,
}: SprintRowProps) {
  const phase = getSprintPhase(sprint);
  const taskCount = tasks.length;
  const progress = useMemo(() => getSprintTaskProgress(tasks), [tasks]);
  const durationDays = useMemo(() => getSprintDurationDays(sprint), [sprint]);
  const durationLabel =
    durationDays == null ? '—' : formatSprintDurationDaysShort(durationDays);
  const durationAriaLabel =
    durationDays == null ? 'Тривалість не визначена' : `Тривалість: ${formatSprintDurationDays(durationDays)}`;
  const [picker, setPicker] = useState<SprintPickerField>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLButtonElement>(null);

  const togglePicker = (field: Exclude<SprintPickerField, null>) => {
    setPicker((current) => (current === field ? null : field));
  };

  return (
    <div
      className={cx(
        styles['ts-row'],
        styles['ts-row-sprint'],
        expanded && styles['ts-row-expanded'],
        taskCount > 0 && styles['ts-row-has-children'],
      )}
      role="row"
      onClick={onOpen}
    >
      <div className={styles['ts-cell-tree']}>
        <button
          type="button"
          className={cx(
            styles['ts-tree-chev'],
            taskCount > 0 && styles['ts-tree-chev-pinned'],
            expanded && styles['ts-tree-chev-open'],
            (expanded || taskCount > 0) && styles['ts-tree-chev-visible'],
          )}
          aria-expanded={expanded}
          aria-label={expanded ? 'Згорнути задачі спринту' : 'Розгорнути задачі спринту'}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <span className={styles['ts-chev']}>{Icons.chevR}</span>
        </button>
      </div>

      <div className={styles['ts-cell-lead']}>
        <button
          ref={statusRef}
          type="button"
          className={cx(
            styles['ts-cell-btn'],
            styles['ts-status-inline'],
            styles['ts-sprint-status-btn'],
            picker === 'status' && styles['ts-sprint-status-btn-open'],
          )}
          onClick={(e) => {
            e.stopPropagation();
            togglePicker('status');
          }}
          aria-label={`Статус: ${SPRINT_PHASE_BADGE_LABELS[phase]}`}
          aria-expanded={picker === 'status'}
          aria-haspopup="listbox"
        >
          <SprintPhaseBadge phase={phase} />
          <span className={styles['ts-sprint-status-chev']} aria-hidden>
            {Icons.chevD}
          </span>
        </button>
        <button type="button" className={styles['ts-title-btn']} onClick={onOpen} aria-label={`Відкрити спринт: ${sprint.title}`}>
          <span className={styles['ts-title-t']}>{sprint.title}</span>
        </button>
      </div>

      <div className={cx(styles['ts-cell-btn'], styles['ts-cell-sprint-progress'])}>
        <SprintProgressBar progress={progress} variant="row" />
      </div>

      <button
        ref={priorityRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-priority'])}
        onClick={(e) => {
          e.stopPropagation();
          togglePicker('priority');
        }}
        aria-label={
          sprint.priority ? `Пріоритет: ${PRIORITIES[sprint.priority].label}` : 'Пріоритет не встановлено'
        }
        aria-expanded={picker === 'priority'}
      >
        <PriorityBadge priority={sprint.priority} />
      </button>

      <button
        ref={assigneeRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-assignee'], styles['ts-cell-sprint-assignee'])}
        onClick={(e) => {
          e.stopPropagation();
          togglePicker('assignee');
        }}
        aria-label="Учасники"
        aria-expanded={picker === 'assignee'}
      >
        <AssigneeCell assigneeIds={sprint.assigneeIds} />
      </button>

      <div className={cx(styles['ts-cell-btn'], styles['ts-cell-sprint-dates'])}>
        <span className={styles['ts-sprint-term']}>
          <span className={styles['ts-sprint-term-range']}>
            <button
              ref={startRef}
              type="button"
              className={styles['ts-sprint-term-date']}
              onClick={(e) => {
                e.stopPropagation();
                togglePicker('start');
              }}
              aria-label="Дата старту"
              aria-expanded={picker === 'start'}
            >
              {formatSprintTermDate(sprint.startDate)}
            </button>
            <span className={styles['ts-sprint-term-sep']} aria-hidden>
              -
            </span>
            <button
              ref={endRef}
              type="button"
              className={styles['ts-sprint-term-date']}
              onClick={(e) => {
                e.stopPropagation();
                togglePicker('end');
              }}
              aria-label="Дата кінця"
              aria-expanded={picker === 'end'}
            >
              {formatSprintTermDate(sprint.endDate)}
            </button>
          </span>
          {durationDays == null ? null : (
            <span className={styles['ts-sprint-duration-badge']} aria-label={durationAriaLabel}>
              {durationLabel}
            </span>
          )}
        </span>
      </div>

      <div className={styles['ts-row-actions']}>
        <button
          type="button"
          className={styles['ts-row-dup']}
          aria-label={`Нова задача: ${sprint.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          {Icons.plus}
        </button>
        <TaskDeleteButton
          taskId={sprint.id}
          armedId={armedDeleteId}
          onArm={onArmDelete}
          onDelete={onDelete}
          itemLabel="sprint"
        />
      </div>

      {picker === 'status' ? (
        <TaskPickerPopover
          open
          anchorRef={statusRef}
          width={168}
          compact
          items={sprintPhasePickerItems(phase)}
          onClose={() => setPicker(null)}
          onSelect={(id) => {
            onUpdate({ phase: id as SprintPhaseId });
            setPicker(null);
          }}
        />
      ) : null}

      {picker === 'priority' ? (
        <TaskPickerPopover
          open
          anchorRef={priorityRef}
          width={200}
          items={priorityPickerItems(sprint.priority)}
          clearOption={{
            id: '__none__',
            label: 'Clear',
            selected: sprint.priority === null,
          }}
          onClose={() => setPicker(null)}
          onSelect={(id) => {
            onUpdate({ priority: id === '__none__' ? null : (id as Priority) });
            setPicker(null);
          }}
        />
      ) : null}

      {picker === 'assignee' ? (
        <TaskPickerPopover
          open
          anchorRef={assigneeRef}
          searchable
          width={280}
          multiSelect
          clearOption={assigneePickerClearOption(sprint.assigneeIds)}
          items={assigneePickerItems(sprint.assigneeIds)}
          onClose={() => setPicker(null)}
          onSelect={(id) => onUpdate({ assigneeIds: toggleAssigneeIds(sprint.assigneeIds, id) })}
        />
      ) : null}

      {picker === 'start' ? (
        <TaskDeadlinePicker
          open
          anchorRef={startRef}
          valueIso={sprint.startDate}
          onClose={() => setPicker(null)}
          onSelectIso={(iso) => onUpdate({ startDate: toDateOnly(iso) ?? sprint.startDate })}
        />
      ) : null}

      {picker === 'end' ? (
        <TaskDeadlinePicker
          open
          anchorRef={endRef}
          valueIso={sprint.endDate}
          onClose={() => setPicker(null)}
          onSelectIso={(iso) => onUpdate({ endDate: toDateOnly(iso) ?? sprint.endDate })}
        />
      ) : null}
    </div>
  );
}
