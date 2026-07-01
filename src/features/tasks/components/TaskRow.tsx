import { useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { PRIORITIES, STATUS_META } from '../constants';
import { formatTaskCompletedAt, formatTaskDeadline, getTaskDeadlineRelativeKind, isCompletedAfterDeadline } from '../dateDisplay';
import { isCompletedStatus } from '../taskCompletion';
import { getChecklistProgress, hasTaskDescription } from '../taskTree';
import styles from '../tasks.module.css';
import type { Priority, Status, TaskCheckItem, TaskPatch, TaskRecurrenceRule, TaskTagId } from '../types';
import {
  AssigneeCell,
  PriorityBadge,
  ProjectCell,
  StatusBadge,
  TaskTagsCell,
  TaskTagsEmptyMark,
  assigneePickerClearOption,
  assigneePickerItems,
  toggleAssigneeIds,
  priorityPickerItems,
  projectPickerItems,
  statusPickerItems,
  tagPickerClearOption,
  tagPickerItems,
  toggleTaskTagIds,
} from '../taskOptions';
import { normalizeCustomTags, normalizeTaskTagIds, taskHasTags, TASK_TAGS } from '../taskTags';
import { TaskDeadlinePicker } from './TaskDeadlinePicker';
import { TaskDeleteButton } from './TaskDeleteButton';
import { TaskPickerPopover } from './TaskPickerPopover';

type PickerField = 'status' | 'tags' | 'priority' | 'deadline' | 'assignee' | 'project' | null;

interface TaskRowProps {
  variant?: 'default' | 'archive' | 'personal' | 'withCompleted';
  depth: number;
  isSubtask: boolean;
  /** Назва батьківської задачі для підказки на стрілці ↳ */
  parentTaskTitle?: string | null;
  title: string;
  description: string;
  checkItems?: TaskCheckItem[];
  status: Status;
  priority: Priority | null;
  tagIds?: TaskTagId[];
  customTags?: string[];
  deadline: string | null;
  completedAt?: string | null;
  recurrenceRule?: TaskRecurrenceRule | null;
  showRecurrence?: boolean;
  assigneeIds: string[];
  projectId: string | null;
  childCount: number;
  hasChildren: boolean;
  expanded?: boolean;
  onToggleExpand: () => void;
  onOpen: () => void;
  onUpdate: (patch: TaskPatch) => void;
  armedDeleteId?: string | null;
  onArmDelete?: (id: string | null) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  deleteTaskId?: string;
  duplicateTaskId?: string;
  onDetach?: () => void;
  detachAriaLabel?: string;
  hideTreeColumn?: boolean;
  hideRowActions?: boolean;
}

export function TaskRow({
  variant = 'default',
  depth,
  isSubtask,
  parentTaskTitle = null,
  title,
  description,
  checkItems = [],
  status,
  priority,
  tagIds: tagIdsProp,
  customTags: customTagsProp,
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
  deleteTaskId,
  duplicateTaskId,
  onDetach,
  detachAriaLabel,
  hideTreeColumn = false,
  hideRowActions = false,
}: TaskRowProps) {
  const tagIds = normalizeTaskTagIds(tagIdsProp);
  const customTags = normalizeCustomTags(customTagsProp);
  const [picker, setPicker] = useState<PickerField>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const tagsRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const deadlineRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const projectRef = useRef<HTMLButtonElement>(null);

  const indentStyle = { ['--ts-tree-depth' as string]: String(depth) };

  const anchorFor = (field: Exclude<PickerField, null>) => {
    switch (field) {
      case 'status':
        return statusRef;
      case 'tags':
        return tagsRef;
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
  const showDelete = Boolean(deleteTaskId && onArmDelete && onDelete);
  const showDuplicate = Boolean(duplicateTaskId && onDuplicate);
  const showDescription = hasTaskDescription(description);
  const checklistProgress = getChecklistProgress(checkItems);
  const showTitleBadges = showDescription || childCount > 0 || checklistProgress !== null;
  const deadlineRelativeKind = getTaskDeadlineRelativeKind(deadline);

  const deadlineTextClassName = (late: boolean) =>
    cx(
      styles['ts-deadline-t'],
      deadlineRelativeKind === 'today' && !late && styles['ts-deadline-t-today'],
      late && styles['ts-deadline-t-late'],
    );

  return (
    <div
      className={cx(
        styles['ts-row'],
        isArchive && styles['ts-row-archive'],
        isSubtask && styles['ts-row-subtask'],
        hasChildren && styles['ts-row-has-children'],
        expanded && styles['ts-row-expanded'],
      )}
      style={indentStyle}
    >
      {hideTreeColumn ? null : (
      <div className={styles['ts-cell-tree']} style={indentStyle}>
        {isArchive && isSubtask && parentTaskTitle ? (
          <button
            type="button"
            className={styles['ts-archive-arrow']}
            title={parentTaskTitle}
            aria-label={`Підзадача · ${parentTaskTitle}`}
            onClick={(e) => e.stopPropagation()}
          >
            ↳
          </button>
        ) : isArchive && isSubtask ? (
          <span className={styles['ts-archive-arrow']} aria-hidden>
            ↳
          </span>
        ) : isArchive ? null : (
          <button
            type="button"
            className={cx(
              styles['ts-tree-chev'],
              hasChildren && styles['ts-tree-chev-pinned'],
              expanded && styles['ts-tree-chev-open'],
              expanded && styles['ts-tree-chev-visible'],
            )}
            aria-expanded={expanded}
            aria-label={expanded ? 'Згорнути підзадачі' : 'Розгорнути підзадачі'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            <span className={styles['ts-chev']}>{Icons.chevR}</span>
          </button>
        )}
      </div>
      )}

      <div className={styles['ts-cell-lead']} style={indentStyle}>
        <button
          ref={statusRef}
          type="button"
          className={cx(styles['ts-cell-btn'], styles['ts-status-inline'])}
          onClick={() => togglePicker('status')}
          aria-label={`Статус: ${STATUS_META[status].label}`}
        >
          <StatusBadge status={status} />
        </button>

        <button type="button" className={styles['ts-title-btn']} onClick={onOpen} aria-label={`Відкрити: ${title}`}>
          <span className={styles['ts-title-inner']}>
            <span className={styles['ts-title-t']}>{title}</span>
            {showTitleBadges ? (
              <span className={styles['ts-title-badges']}>
                {showDescription ? (
                  <span className={styles['ts-desc-badge']} aria-label="Є опис">
                    <span className={styles['ts-desc-badge-i']} aria-hidden>
                      {Icons.description}
                    </span>
                  </span>
                ) : null}
                {childCount > 0 ? (
                  <span className={styles['ts-subtree-badge']} aria-label={`${childCount} підзадач`}>
                    <span className={styles['ts-subtree-badge-i']} aria-hidden>
                      {Icons.subtree}
                    </span>
                    <span className={styles['ts-subtree-badge-n']}>{childCount}</span>
                  </span>
                ) : null}
                {checklistProgress ? (
                  <span
                    className={styles['ts-checklist-badge']}
                    aria-label={`Чекліст: ${checklistProgress.done} з ${checklistProgress.total}`}
                  >
                    <span className={styles['ts-checklist-badge-n']}>
                      {checklistProgress.done}/{checklistProgress.total}
                    </span>
                  </span>
                ) : null}
              </span>
            ) : null}
          </span>
        </button>
      </div>

      <div className={styles['ts-cell-tags']}>
        <button
          ref={tagsRef}
          type="button"
          className={styles['ts-cell-btn']}
          onClick={() => togglePicker('tags')}
          aria-label={
            taskHasTags(tagIds, customTags)
              ? `Теги: ${[...tagIds.map((id) => TASK_TAGS[id]?.label ?? id), ...customTags].join(', ')}`
              : 'Обрати теги'
          }
        >
          {taskHasTags(tagIds, customTags) ? (
            <TaskTagsCell tagIds={tagIds} customTags={customTags} />
          ) : (
            <TaskTagsEmptyMark />
          )}
        </button>
      </div>

      <button
        ref={priorityRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-priority'])}
        onClick={() => togglePicker('priority')}
        aria-label={priority ? `Пріоритет: ${PRIORITIES[priority].label}` : 'Пріоритет не встановлено'}
      >
        <PriorityBadge priority={priority} />
      </button>

      {isArchive ? (
        <div className={cx(styles['ts-cell-btn'], styles['ts-cell-deadline'])} aria-label="Дедлайн">
          {deadline ? (
            <span className={deadlineTextClassName(deadlineLate)}>
              {formatTaskDeadline(deadline)}
            </span>
          ) : (
            <span className={styles['ts-empty']}>—</span>
          )}
        </div>
      ) : (
        <button
          ref={deadlineRef}
          type="button"
          className={cx(styles['ts-cell-btn'], styles['ts-cell-deadline'])}
          onClick={() => togglePicker('deadline')}
          aria-label="Дедлайн"
        >
          {deadline ? (
            <span className={styles['ts-deadline-wrap']}>
              <span className={deadlineTextClassName(deadlineLate)}>
                {formatTaskDeadline(deadline)}
              </span>
              {recurrenceRule ? (
                <span className={styles['ts-recur-mark']} aria-label="Повторювана задача">
                  {Icons.repeat}
                </span>
              ) : null}
            </span>
          ) : (
            <span className={styles['ts-empty']}>—</span>
          )}
        </button>
      )}

      <button
        ref={assigneeRef}
        type="button"
        className={cx(styles['ts-cell-btn'], styles['ts-cell-assignee'])}
        onClick={() => togglePicker('assignee')}
        aria-label="Відповідальний"
      >
        <AssigneeCell assigneeIds={assigneeIds} />
      </button>

      {!isPersonal ? (
        <button
          ref={projectRef}
          type="button"
          className={cx(styles['ts-cell-btn'], styles['ts-cell-project'])}
          onClick={() => togglePicker('project')}
          aria-label="Проєкт"
        >
          <ProjectCell projectId={projectId} />
        </button>
      ) : null}

      {showCompleted ? (
        <div className={styles['ts-cell-completed-at']} aria-label="Дата виконання">
          <span className={styles['ts-deadline-t']}>{formatTaskCompletedAt(completedAt)}</span>
        </div>
      ) : null}

      {hideRowActions ? null : (
      <div className={styles['ts-row-actions']}>
        {onDetach ? (
          <button
            type="button"
            className={styles['ts-row-dup']}
            aria-label={detachAriaLabel ?? 'Прибрати зі спринту'}
            onClick={(e) => {
              e.stopPropagation();
              onDetach();
            }}
          >
            {Icons.close}
          </button>
        ) : null}
        {showDuplicate ? (
          <button
            type="button"
            className={styles['ts-row-dup']}
            aria-label={isSubtask ? 'Дублювати підзадачу' : 'Дублювати задачу'}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate!(duplicateTaskId!);
            }}
          >
            {Icons.duplicate}
          </button>
        ) : null}
        {showDelete ? (
          <TaskDeleteButton
            taskId={deleteTaskId!}
            armedId={armedDeleteId}
            onArm={onArmDelete!}
            onDelete={onDelete!}
            itemLabel={isSubtask ? 'subtask' : 'task'}
          />
        ) : null}
      </div>
      )}

      {!isArchive && picker === 'deadline' ? (
        <TaskDeadlinePicker
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
        <TaskPickerPopover
          open
          anchorRef={picker === 'tags' ? tagsRef : anchorFor(picker)}
          searchable={picker === 'assignee' || picker === 'project'}
          width={
            picker === 'assignee' || picker === 'project'
              ? 280
              : picker === 'priority' || picker === 'tags'
                ? 200
                : picker === 'status'
                  ? 168
                  : 220
          }
          compact={picker === 'status'}
          multiSelect={picker === 'assignee' || picker === 'tags'}
          clearOption={
            picker === 'priority'
              ? {
                  id: '__none__',
                  label: 'Clear',
                  selected: priority === null,
                }
              : picker === 'assignee'
                ? assigneePickerClearOption(assigneeIds)
                : picker === 'tags'
                  ? tagPickerClearOption(tagIds, customTags)
                  : undefined
          }
          items={
            picker === 'status'
              ? statusPickerItems(status)
              : picker === 'tags'
                ? tagPickerItems(tagIds)
                : picker === 'priority'
                  ? priorityPickerItems(priority)
                  : picker === 'assignee'
                    ? assigneePickerItems(assigneeIds)
                    : projectPickerItems(projectId)
          }
          onClose={() => setPicker(null)}
          onSelect={(id) => {
            if (picker === 'status') onUpdate({ status: id as Status });
            if (picker === 'tags') {
              if (id === '__none__') onUpdate({ tagIds: [], customTags: [] });
              else onUpdate({ tagIds: toggleTaskTagIds(tagIds, id) });
            }
            if (picker === 'priority') onUpdate({ priority: id === '__none__' ? null : (id as Priority) });
            if (picker === 'assignee') onUpdate({ assigneeIds: toggleAssigneeIds(assigneeIds, id) });
            if (picker === 'project') onUpdate({ projectId: id === '__none__' ? null : id });
          }}
        />
      ) : null}
    </div>
  );
}
