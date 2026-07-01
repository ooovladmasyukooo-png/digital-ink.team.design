import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { PRIORITIES } from '../constants';
import { formatTaskDateTime, formatTaskDeadline } from '../dateDisplay';
import { SPRINT_PHASE_BADGE_LABELS } from '../sprints';
import { sprintPhasePickerItems } from '../sprintOptions';
import { getSprintTaskProgress } from '../sprintProgress';
import type { Sprint } from '../sprints';
import type { SprintPatch } from '../sprintsStore';
import styles from '../tasks.module.css';
import type { Priority, SprintPhaseId, Task, TaskComment, TaskPatch, TaskSubtask, TasksSortField } from '../types';
import {
  AssigneeCell,
  PriorityBadge,
  assigneePickerClearOption,
  assigneePickerItems,
  priorityPickerItems,
  teamById,
  toggleAssigneeIds,
} from '../taskOptions';
import { CommentsSection } from './CommentsSection';
import { SprintDrawerTasksSection } from './SprintDrawerTasksSection';
import { SprintProgressBar } from './SprintProgressBar';
import { SprintPhaseBadge } from './SprintPhaseBadge';
import { TaskDeadlinePicker } from './TaskDeadlinePicker';
import { TaskPickerPopover } from './TaskPickerPopover';

type SprintFieldPicker = 'status' | 'priority' | 'start' | 'end' | 'assignee' | null;

function toDateOnly(iso: string | null): string | null {
  if (!iso) return null;
  return iso.split('T')[0] ?? null;
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

interface SprintDetailPanelProps {
  sprint: Sprint;
  sprintTasks: Task[];
  searchTasks: Task[];
  armedDeleteId: string | null;
  expandedTreeKeys: ReadonlySet<string>;
  onClose: () => void;
  onUpdate: (patch: SprintPatch) => void;
  onOpenTask: (taskId: string, subtaskPath?: string[]) => void;
  onAssignTask: (taskId: string) => void;
  onAssignTaskAsSubtask: (taskId: string, rootId: string, parentPath: string[]) => void;
  onCreateTask: () => void;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onArmDelete: (id: string | null) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onUpdateTask: (id: string, patch: TaskPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  sortField: TasksSortField;
}

export function SprintDetailPanel({
  sprint,
  sprintTasks,
  searchTasks,
  armedDeleteId,
  expandedTreeKeys,
  onClose,
  onUpdate,
  onOpenTask,
  onAssignTask,
  onAssignTaskAsSubtask,
  onCreateTask,
  onToggleTreeExpand,
  onArmDelete,
  onDeleteTask,
  onDuplicateTask,
  onUpdateTask,
  onUpdateSubtask,
  onAddSubtask,
  sortField,
}: SprintDetailPanelProps) {
  const [picker, setPicker] = useState<SprintFieldPicker>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);

  const creator = teamById[sprint.creatorId];
  const creatorName = creator?.name ?? sprint.creatorId;
  const createdAtLabel = formatTaskDateTime(sprint.createdAt);

  useEffect(() => {
    setPicker(null);
  }, [sprint.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    syncTextareaHeight(titleRef.current);
    syncTextareaHeight(descRef.current);
  }, [sprint.id, sprint.title, sprint.description]);

  const sprintProgress = useMemo(() => getSprintTaskProgress(sprintTasks), [sprintTasks]);

  const togglePicker = (field: Exclude<SprintFieldPicker, null>) => {
    setPicker((current) => (current === field ? null : field));
  };

  return createPortal(
    <>
      <button
        type="button"
        className={cx(styles['ts-drawer-backdrop'], styles['ts-sprint-drawer-backdrop'])}
        aria-label="Закрити картку спринту"
        onClick={onClose}
      />
      <aside
        className={cx(styles['ts-drawer'], styles['ts-sprint-drawer'])}
        role="dialog"
        aria-modal="true"
        aria-label={sprint.title}
      >
        <header className={cx(styles['ts-detail-head'], styles['ts-detail-head-drawer'], styles['ts-sprint-drawer-head'])}>
          <div className={styles['ts-sprint-drawer-head-start']}>
            <div className={styles['ts-detail-head-actions']}>
              <button type="button" className={styles['ts-drawer-close']} aria-label="Закрити" onClick={onClose}>
                {Icons.close}
              </button>
            </div>
            <SprintProgressBar progress={sprintProgress} variant="header" />
          </div>
          <div className={styles['ts-detail-top-meta']}>
            <span className={styles['ts-drawer-creator-av']} title={creatorName} aria-label={`Автор: ${creatorName}`}>
              <Avatar name={creatorName} hue={creator?.hue ?? 0} size="sm" />
            </span>
            <time className={styles['ts-drawer-created']} dateTime={sprint.createdAt} title={createdAtLabel}>
              {createdAtLabel}
            </time>
          </div>
        </header>

        <div className={styles['ts-drawer-scroll']}>
          <div className={styles['ts-drawer-body']}>
            <textarea
              ref={titleRef}
              className={styles['ts-detail-title']}
              value={sprint.title}
              rows={1}
              onChange={(e) => {
                onUpdate({ title: e.target.value });
                syncTextareaHeight(e.target);
              }}
              onFocus={(e) => syncTextareaHeight(e.target)}
              aria-label="Назва спринту"
            />

            <div className={styles['ts-detail-rows']}>
              <DetailRow
                label="Статус"
                ariaLabel={`Статус: ${SPRINT_PHASE_BADGE_LABELS[sprint.phase]}`}
                buttonRef={statusRef}
                onClick={() => togglePicker('status')}
              >
                <SprintPhaseBadge phase={sprint.phase} />
              </DetailRow>

              <DetailRow
                label="Пріоритет"
                ariaLabel={
                  sprint.priority ? `Пріоритет: ${PRIORITIES[sprint.priority].label}` : 'Пріоритет не встановлено'
                }
                buttonRef={priorityRef}
                onClick={() => togglePicker('priority')}
              >
                <PriorityBadge priority={sprint.priority} />
              </DetailRow>

              <DetailRow label="Старт" ariaLabel="Дата старту" buttonRef={startRef} onClick={() => togglePicker('start')}>
                <span className={styles['ts-detail-deadline']}>{formatTaskDeadline(sprint.startDate)}</span>
              </DetailRow>

              <DetailRow label="Кінець" ariaLabel="Дата кінця" buttonRef={endRef} onClick={() => togglePicker('end')}>
                <span className={styles['ts-detail-deadline']}>{formatTaskDeadline(sprint.endDate)}</span>
              </DetailRow>

              <DetailRow
                label="Учасники"
                ariaLabel="Учасники"
                buttonRef={assigneeRef}
                onClick={() => togglePicker('assignee')}
              >
                <AssigneeCell assigneeIds={sprint.assigneeIds} />
              </DetailRow>
            </div>

            <div className={styles['ts-detail-desc-block']}>
              <span className={styles['ts-detail-k']}>Опис</span>
              <textarea
                ref={descRef}
                className={styles['ts-detail-desc']}
                value={sprint.description}
                placeholder="Додайте цілі спринту, контекст, посилання…"
                rows={3}
                onChange={(e) => {
                  onUpdate({ description: e.target.value });
                  syncTextareaHeight(e.target);
                }}
                aria-label="Опис спринту"
              />
            </div>
          </div>

          <footer className={styles['ts-drawer-footer']}>
            <SprintDrawerTasksSection
              sprintTasks={sprintTasks}
              searchTasks={searchTasks}
              armedDeleteId={armedDeleteId}
              expandedTreeKeys={expandedTreeKeys}
              onToggleTreeExpand={onToggleTreeExpand}
              onArmDelete={onArmDelete}
              onDelete={onDeleteTask}
              onDuplicate={onDuplicateTask}
              onUpdate={onUpdateTask}
              onUpdateSubtask={onUpdateSubtask}
              onAddSubtask={onAddSubtask}
              onOpenTask={onOpenTask}
              onAssignTask={onAssignTask}
              onAssignTaskAsSubtask={onAssignTaskAsSubtask}
              onCreateTask={onCreateTask}
              sortField={sortField}
            />

            <CommentsSection
              taskId={sprint.id}
              comments={sprint.comments}
              activityLog={sprint.activityLog}
              onChange={(comments: TaskComment[]) => onUpdate({ comments })}
            />
          </footer>
        </div>

        {picker === 'status' ? (
          <TaskPickerPopover
            open
            anchorRef={statusRef}
            width={168}
            compact
            items={sprintPhasePickerItems(sprint.phase)}
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
      </aside>
    </>,
    document.body,
  );
}
