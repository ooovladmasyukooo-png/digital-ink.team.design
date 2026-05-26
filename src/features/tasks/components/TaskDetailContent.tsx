import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { PRIORITIES, STATUS_META } from '../constants';
import { formatTaskDeadline, isCompletedAfterDeadline } from '../dateDisplay';
import { isCompletedStatus } from '../taskCompletion';
import styles from '../tasks.module.css';
import type { Priority, Status, Task, TaskPatch } from '../types';
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
import { normalizeCustomTags, normalizeTaskTagIds, taskHasTags } from '../taskTags';
import { ChecklistSection } from './ChecklistSection';
import { CommentsSection } from './CommentsSection';
import { SubtasksSection } from './SubtasksSection';
import { TaskDeadlinePicker } from './TaskDeadlinePicker';
import { TaskPickerPopover } from './TaskPickerPopover';

type PickerField = 'status' | 'tags' | 'priority' | 'deadline' | 'assignee' | 'project' | null;

export interface TaskDetailContentProps {
  task: Task;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onOpenSubtask: (subtaskId: string) => void;
  parentTask?: Pick<Task, 'id' | 'title'>;
  parentTaskLabel?: string;
  onOpenParentTask?: () => void;
  scrollClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

function syncTextareaHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

interface DetailRowProps {
  label: string;
  ariaLabel: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  children: ReactNode;
}

function DetailRow({ label, ariaLabel, buttonRef, onClick, children }: DetailRowProps) {
  return (
    <div className={styles['ts-detail-row']}>
      <span className={styles['ts-detail-k']}>{label}</span>
      <button ref={buttonRef} type="button" className={styles['ts-detail-v']} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </button>
    </div>
  );
}

export function TaskDetailContent({
  task,
  onUpdate,
  onOpenSubtask,
  parentTask,
  parentTaskLabel = 'Головна задача',
  onOpenParentTask,
  scrollClassName,
  bodyClassName,
  footerClassName,
}: TaskDetailContentProps) {
  const [picker, setPicker] = useState<PickerField>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const tagsRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const tagIds = normalizeTaskTagIds(task.tagIds);
  const customTags = normalizeCustomTags(task.customTags);
  const deadlineRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const projectRef = useRef<HTMLButtonElement>(null);

  const patch = useCallback((p: TaskPatch) => onUpdate(task.id, p), [onUpdate, task.id]);

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

  useLayoutEffect(() => {
    syncTextareaHeight(titleRef.current);
    syncTextareaHeight(descRef.current);
  }, [task.id, task.title, task.description]);

  return (
    <>
      <div className={scrollClassName ?? styles['ts-drawer-scroll']}>
        <div className={bodyClassName ?? styles['ts-drawer-body']}>
          <textarea
            ref={titleRef}
            className={styles['ts-detail-title']}
            value={task.title}
            rows={1}
            onChange={(e) => {
              patch({ title: e.target.value });
              syncTextareaHeight(e.target);
            }}
            onFocus={(e) => syncTextareaHeight(e.target)}
            aria-label="Заголовок задачі"
          />

          <div className={styles['ts-detail-rows']}>
            <DetailRow
              label="Статус"
              ariaLabel={`Статус: ${STATUS_META[task.status].label}`}
              buttonRef={statusRef}
              onClick={() => togglePicker('status')}
            >
              <StatusBadge status={task.status} />
            </DetailRow>

            <DetailRow
              label="Теги"
              ariaLabel={
                taskHasTags(tagIds, customTags)
                  ? `Теги: ${[...tagIds, ...customTags].join(', ')}`
                  : 'Теги не встановлено'
              }
              buttonRef={tagsRef}
              onClick={() => togglePicker('tags')}
            >
              {taskHasTags(tagIds, customTags) ? (
                <TaskTagsCell tagIds={tagIds} customTags={customTags} variant="full" />
              ) : (
                <TaskTagsEmptyMark />
              )}
            </DetailRow>

            <DetailRow
              label="Пріоритет"
              ariaLabel={
                task.priority ? `Пріоритет: ${PRIORITIES[task.priority].label}` : 'Пріоритет не встановлено'
              }
              buttonRef={priorityRef}
              onClick={() => togglePicker('priority')}
            >
              <PriorityBadge priority={task.priority} />
            </DetailRow>

            <DetailRow label="Дедлайн" ariaLabel="Дедлайн" buttonRef={deadlineRef} onClick={() => togglePicker('deadline')}>
              {task.deadline ? (
                <span
                  className={cx(
                    styles['ts-detail-deadline'],
                    isCompletedStatus(task.status) &&
                      isCompletedAfterDeadline(task.deadline, task.completedAt) &&
                      styles['ts-deadline-t-late'],
                  )}
                >
                  {formatTaskDeadline(task.deadline)}
                  {task.recurrenceRule ? (
                    <span className={styles['ts-recur-mark']} aria-label="Повторювана задача">
                      {Icons.repeat}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className={styles['ts-detail-empty']}>—</span>
              )}
            </DetailRow>

            <DetailRow
              label="Відповідальні"
              ariaLabel="Відповідальні"
              buttonRef={assigneeRef}
              onClick={() => togglePicker('assignee')}
            >
              <AssigneeCell assigneeIds={task.assigneeIds} />
            </DetailRow>

            <DetailRow label="Проєкт" ariaLabel="Проєкт" buttonRef={projectRef} onClick={() => togglePicker('project')}>
              <ProjectCell projectId={task.projectId} />
            </DetailRow>

            {parentTask && onOpenParentTask ? (
              <div className={styles['ts-detail-row']}>
                <span className={styles['ts-detail-k']}>{parentTaskLabel}</span>
                <button
                  type="button"
                  className={styles['ts-detail-parent']}
                  onClick={onOpenParentTask}
                  aria-label={`Відкрити головну задачу: ${parentTask.title}`}
                >
                  <span className={styles['ts-detail-parent-t']}>{parentTask.title}</span>
                  <span className={styles['ts-detail-parent-i']} aria-hidden>
                    {Icons.openExternal}
                  </span>
                </button>
              </div>
            ) : null}
          </div>

          <div className={styles['ts-detail-desc-block']}>
            <span className={styles['ts-detail-k']}>Опис</span>
            <textarea
              ref={descRef}
              className={styles['ts-detail-desc']}
              value={task.description}
              placeholder="Додайте деталі, контекст, посилання…"
              rows={3}
              onChange={(e) => {
                patch({ description: e.target.value });
                syncTextareaHeight(e.target);
              }}
              aria-label="Опис задачі"
            />
          </div>
        </div>

        <footer className={footerClassName ?? styles['ts-drawer-footer']}>
          <SubtasksSection
            subtasks={task.subtasks}
            rootProjectId={task.projectId}
            onChange={(subtasks) => patch({ subtasks })}
            onOpenSubtask={onOpenSubtask}
          />
          <ChecklistSection checkItems={task.checkItems} onChange={(checkItems) => patch({ checkItems })} />
          <CommentsSection taskId={task.id} comments={task.comments} onChange={(comments) => patch({ comments })} />
        </footer>
      </div>

      {picker === 'deadline' ? (
        <TaskDeadlinePicker
          open
          anchorRef={deadlineRef}
          valueIso={task.deadline}
          recurrenceRule={task.recurrenceRule}
          showRecurrence={!parentTask}
          onClose={() => setPicker(null)}
          onSelectIso={(iso) => patch({ deadline: iso })}
          onRecurrenceChange={(rule) => patch({ recurrenceRule: rule })}
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
                  selected: task.priority === null,
                }
              : picker === 'assignee'
                ? assigneePickerClearOption(task.assigneeIds)
                : picker === 'tags'
                  ? tagPickerClearOption(tagIds, customTags)
                  : undefined
          }
          items={
            picker === 'status'
              ? statusPickerItems(task.status)
              : picker === 'tags'
                ? tagPickerItems(tagIds)
                : picker === 'priority'
                  ? priorityPickerItems(task.priority)
                  : picker === 'assignee'
                    ? assigneePickerItems(task.assigneeIds)
                    : projectPickerItems(task.projectId)
          }
          onClose={() => setPicker(null)}
          onSelect={(id) => {
            if (picker === 'status') patch({ status: id as Status });
            if (picker === 'tags') {
              if (id === '__none__') patch({ tagIds: [], customTags: [] });
              else patch({ tagIds: toggleTaskTagIds(tagIds, id) });
            }
            if (picker === 'priority') patch({ priority: id === '__none__' ? null : (id as Priority) });
            if (picker === 'assignee') patch({ assigneeIds: toggleAssigneeIds(task.assigneeIds, id) });
            if (picker === 'project') patch({ projectId: id === '__none__' ? null : id });
          }}
        />
      ) : null}
    </>
  );
}
