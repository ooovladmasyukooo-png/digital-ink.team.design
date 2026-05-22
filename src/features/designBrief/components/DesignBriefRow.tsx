import { useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { PRIORITIES, STATUS_META } from '../constants';
import { formatTaskCompletedAt, formatTaskDeadline, getTaskDeadlineRelativeKind, isCompletedAfterDeadline } from '../dateDisplay';
import { isCompletedStatus } from '../designBriefCompletion';
import { hasTaskDescription } from '../designBriefTree';
import styles from '../designBrief.module.css';
import type { Priority, Status, DesignBriefPatch, DesignBriefRecurrenceRule } from '../types';
import {
  AssigneeCell,
  PriorityBadge,
  ProjectCell,
  StatusBadge,
  assigneePickerClearOption,
  assigneePickerItems,
  toggleAssigneeIds,
  priorityPickerItems,
  projectPickerItems,
  statusPickerItems,
} from '../designBriefOptions';
import { DesignBriefDeadlinePicker } from './DesignBriefDeadlinePicker';
import { DesignBriefDeleteButton } from './DesignBriefDeleteButton';
import { DesignBriefPickerPopover } from './DesignBriefPickerPopover';

type PickerField = 'status' | 'priority' | 'deadline' | 'assignee' | 'project' | null;

interface DesignBriefRowProps {
  variant?: 'default' | 'archive' | 'personal' | 'withCompleted';
  depth: number;
  isSubtask: boolean;
  /** Назва батьківської задачі для підказки на стрілці ↳ */
  parentBriefTitle?: string | null;
  title: string;
  description: string;
  status: Status;
  priority: Priority | null;
  deadline: string | null;
  completedAt?: string | null;
  recurrenceRule?: DesignBriefRecurrenceRule | null;
  showRecurrence?: boolean;
  assigneeIds: string[];
  projectId: string | null;
  childCount: number;
  hasChildren: boolean;
  expanded?: boolean;
  onToggleExpand: () => void;
  onOpen: () => void;
  onUpdate: (patch: DesignBriefPatch) => void;
  armedDeleteId?: string | null;
  onArmDelete?: (id: string | null) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  deleteBriefId?: string;
  duplicateBriefId?: string;
}

export function DesignBriefRow({
  variant = 'default',
  depth,
  isSubtask,
  parentBriefTitle = null,
  title,
  description,
  status,
  priority,
  deadline,
  completedAt = null,
  recurrenceRule = null,
  showRecurrence = false,
  assigneeIds,
  projectId,
  childCount,
  hasChildren,
  expanded = false,
  onToggleExpand,
  onOpen,
  onUpdate,
  armedDeleteId = null,
  onArmDelete,
  onDelete,
  onDuplicate,
  deleteBriefId,
  duplicateBriefId,
}: DesignBriefRowProps) {
  const [picker, setPicker] = useState<PickerField>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const deadlineRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const projectRef = useRef<HTMLButtonElement>(null);

  const indentStyle = { ['--ts-tree-depth' as string]: String(depth) };

  const anchorFor = (field: Exclude<PickerField, null>) => {
    switch (field) {
      case 'status':
        return statusRef;
      case 'priority':
        return priorityRef;
      case 'deadline':
        return deadlineRef;
      case 'assignee':
        return assigneeRef;
      case 'project':
        return projectRef;
    }
  };

  const togglePicker = (field: Exclude<PickerField, null>) => {
    setPicker((current) => (current === field ? null : field));
  };

  const isArchive = variant === 'archive';
  const isPersonal = variant === 'personal';
  const showCompleted = isArchive || variant === 'withCompleted';
  const deadlineLate =
    Boolean(deadline) &&
    Boolean(completedAt) &&
    isCompletedStatus(status) &&
    isCompletedAfterDeadline(deadline, completedAt);
  const showDelete = Boolean(deleteBriefId && onArmDelete && onDelete);
  const showDuplicate = Boolean(duplicateBriefId && onDuplicate);
  const showDescription = hasTaskDescription(description);
  const deadlineRelativeKind = getTaskDeadlineRelativeKind(deadline);

  const deadlineTextClassName = (late: boolean) =>
    cx(
      styles['db-deadline-t'],
      deadlineRelativeKind === 'today' && !late && styles['db-deadline-t-today'],
      late && styles['db-deadline-t-late'],
    );

  return (
    <div
      className={cx(
        styles['db-row'],
        isArchive && styles['db-row-archive'],
        isSubtask && styles['db-row-subtask'],
        hasChildren && styles['db-row-has-children'],
        expanded && styles['db-row-expanded'],
      )}
      style={indentStyle}
    >
      <div className={styles['db-cell-tree']} style={indentStyle}>
        {isArchive && isSubtask && parentBriefTitle ? (
          <button
            type="button"
            className={styles['db-archive-arrow']}
            title={parentBriefTitle}
            aria-label={`Підзадача · ${parentBriefTitle}`}
            onClick={(e) => e.stopPropagation()}
          >
            ↳
          </button>
        ) : isArchive && isSubtask ? (
          <span className={styles['db-archive-arrow']} aria-hidden>
            ↳
          </span>
        ) : isArchive ? null : (
          <button
            type="button"
            className={cx(
              styles['db-tree-chev'],
              hasChildren && styles['db-tree-chev-pinned'],
              expanded && styles['db-tree-chev-open'],
              expanded && styles['db-tree-chev-visible'],
            )}
            aria-expanded={expanded}
            aria-label={expanded ? 'Згорнути підзадачі' : 'Розгорнути підзадачі'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            <span className={styles['db-chev']}>{Icons.chevR}</span>
          </button>
        )}
      </div>

      <div className={styles['db-cell-lead']} style={indentStyle}>
        <button
          ref={statusRef}
          type="button"
          className={cx(styles['db-cell-btn'], styles['db-status-inline'])}
          onClick={() => togglePicker('status')}
          aria-label={`Статус: ${STATUS_META[status].label}`}
        >
          <StatusBadge status={status} />
        </button>

        <button type="button" className={styles['db-title-btn']} onClick={onOpen} aria-label={`Відкрити: ${title}`}>
          <span className={styles['db-title-t']}>{title}</span>
          {showDescription || childCount > 0 ? (
            <span className={styles['db-title-badges']}>
              {showDescription ? (
                <span className={styles['db-desc-badge']} aria-label="Є опис">
                  <span className={styles['db-desc-badge-i']} aria-hidden>
                    {Icons.description}
                  </span>
                </span>
              ) : null}
              {childCount > 0 ? (
                <span className={styles['db-subtree-badge']} aria-label={`${childCount} підзадач`}>
                  <span className={styles['db-subtree-badge-i']} aria-hidden>
                    {Icons.subtree}
                  </span>
                  <span className={styles['db-subtree-badge-n']}>{childCount}</span>
                </span>
              ) : null}
            </span>
          ) : null}
        </button>
      </div>

      <button
        ref={priorityRef}
        type="button"
        className={cx(styles['db-cell-btn'], styles['db-cell-priority'])}
        onClick={() => togglePicker('priority')}
        aria-label={priority ? `Пріоритет: ${PRIORITIES[priority].label}` : 'Пріоритет не встановлено'}
      >
        <PriorityBadge priority={priority} />
      </button>

      {isArchive ? (
        <div className={cx(styles['db-cell-btn'], styles['db-cell-deadline'])} aria-label="Дедлайн">
          {deadline ? (
            <span className={deadlineTextClassName(deadlineLate)}>
              {formatTaskDeadline(deadline)}
            </span>
          ) : (
            <span className={styles['db-empty']}>—</span>
          )}
        </div>
      ) : (
        <button
          ref={deadlineRef}
          type="button"
          className={cx(styles['db-cell-btn'], styles['db-cell-deadline'])}
          onClick={() => togglePicker('deadline')}
          aria-label="Дедлайн"
        >
          {deadline ? (
            <span className={styles['db-deadline-wrap']}>
              <span className={deadlineTextClassName(deadlineLate)}>
                {formatTaskDeadline(deadline)}
              </span>
              {recurrenceRule ? (
                <span className={styles['db-recur-mark']} aria-label="Повторювана задача">
                  {Icons.repeat}
                </span>
              ) : null}
            </span>
          ) : (
            <span className={styles['db-empty']}>—</span>
          )}
        </button>
      )}

      <button
        ref={assigneeRef}
        type="button"
        className={cx(styles['db-cell-btn'], styles['db-cell-assignee'])}
        onClick={() => togglePicker('assignee')}
        aria-label="Відповідальний"
      >
        <AssigneeCell assigneeIds={assigneeIds} />
      </button>

      {!isPersonal ? (
        <button
          ref={projectRef}
          type="button"
          className={cx(styles['db-cell-btn'], styles['db-cell-project'])}
          onClick={() => togglePicker('project')}
          aria-label="Проєкт"
        >
          <ProjectCell projectId={projectId} />
        </button>
      ) : null}

      {showCompleted ? (
        <div className={styles['db-cell-completed-at']} aria-label="Дата виконання">
          <span className={styles['db-deadline-t']}>{formatTaskCompletedAt(completedAt)}</span>
        </div>
      ) : null}

      <div className={styles['db-row-actions']}>
        {showDuplicate ? (
          <button
            type="button"
            className={styles['db-row-dup']}
            aria-label={isSubtask ? 'Дублювати підзадачу' : 'Дублювати ТЗ'}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate!(duplicateBriefId!);
            }}
          >
            {Icons.duplicate}
          </button>
        ) : null}
        {showDelete ? (
          <DesignBriefDeleteButton
            briefId={deleteBriefId!}
            armedId={armedDeleteId}
            onArm={onArmDelete!}
            onDelete={onDelete!}
            itemLabel={isSubtask ? 'subtask' : 'task'}
          />
        ) : null}
      </div>

      {!isArchive && picker === 'deadline' ? (
        <DesignBriefDeadlinePicker
          open
          anchorRef={deadlineRef}
          valueIso={deadline}
          recurrenceRule={recurrenceRule}
          showRecurrence={showRecurrence}
          onClose={() => setPicker(null)}
          onSelectIso={(iso) => onUpdate({ deadline: iso })}
          onRecurrenceChange={(rule) => onUpdate({ recurrenceRule: rule })}
        />
      ) : null}

      {picker && picker !== 'deadline' ? (
        <DesignBriefPickerPopover
          open
          anchorRef={anchorFor(picker)}
          searchable={picker === 'assignee' || picker === 'project'}
          width={
            picker === 'assignee' || picker === 'project'
              ? 280
              : picker === 'priority'
                ? 200
                : picker === 'status'
                  ? 168
                  : 220
          }
          compact={picker === 'status'}
          multiSelect={picker === 'assignee'}
          clearOption={
            picker === 'priority'
              ? {
                  id: '__none__',
                  label: 'Clear',
                  selected: priority === null,
                }
              : picker === 'assignee'
                ? assigneePickerClearOption(assigneeIds)
                : undefined
          }
          items={
            picker === 'status'
              ? statusPickerItems(status)
              : picker === 'priority'
                ? priorityPickerItems(priority)
                : picker === 'assignee'
                  ? assigneePickerItems(assigneeIds)
                  : projectPickerItems(projectId)
          }
          onClose={() => setPicker(null)}
          onSelect={(id) => {
            if (picker === 'status') onUpdate({ status: id as Status });
            if (picker === 'priority') onUpdate({ priority: id === '__none__' ? null : (id as Priority) });
            if (picker === 'assignee') onUpdate({ assigneeIds: toggleAssigneeIds(assigneeIds, id) });
            if (picker === 'project') onUpdate({ projectId: id === '__none__' ? null : id });
          }}
        />
      ) : null}
    </div>
  );
}
