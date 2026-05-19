import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { PRIORITIES, STATUS_META } from '../constants';
import { formatTaskDeadline } from '../dateDisplay';
import styles from '../tasks.module.css';
import type { Priority, Status, Task, TaskPatch } from '../types';
import {
  AssigneeCell,
  PriorityBadge,
  ProjectCell,
  StatusBadge,
  assigneePickerItems,
  priorityPickerItems,
  projectPickerItems,
  statusPickerItems,
} from '../taskOptions';
import { ChecklistSection } from './ChecklistSection';
import { CommentsSection } from './CommentsSection';
import { SubtasksSection } from './SubtasksSection';
import { TaskDeadlinePicker } from './TaskDeadlinePicker';
import { TaskPickerPopover } from './TaskPickerPopover';

type PickerField = 'status' | 'priority' | 'deadline' | 'assignee' | 'project' | null;

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onOpenSubtask: (subtaskId: string) => void;
  parentTask?: Pick<Task, 'id' | 'title'>;
  parentTaskLabel?: string;
  onOpenParentTask?: () => void;
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

export function TaskDetailPanel({
  task,
  onClose,
  onUpdate,
  onOpenSubtask,
  parentTask,
  parentTaskLabel = 'Головна задача',
  onOpenParentTask,
}: TaskDetailPanelProps) {
  const [picker, setPicker] = useState<PickerField>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const deadlineRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const projectRef = useRef<HTMLButtonElement>(null);

  const patch = useCallback((p: TaskPatch) => onUpdate(task.id, p), [onUpdate, task.id]);

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

  useLayoutEffect(() => {
    syncTextareaHeight(titleRef.current);
    syncTextareaHeight(descRef.current);
  }, [task.id, task.title, task.description]);

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

  const onShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('task', task.id);
    const text = `${task.title}\n${url.toString()}`;
    try {
      await navigator.clipboard.writeText(text);
      setShareNote('Скопійовано');
      window.setTimeout(() => setShareNote(null), 2000);
    } catch {
      setShareNote('Не вдалося скопіювати');
      window.setTimeout(() => setShareNote(null), 2000);
    }
  };

  return createPortal(
    <>
      <button type="button" className={styles['ts-drawer-backdrop']} aria-label="Закрити картку задачі" onClick={onClose} />
      <aside className={styles['ts-drawer']} role="dialog" aria-modal="true" aria-label={task.title}>
        <header className={styles['ts-drawer-top']}>
          <button type="button" className={styles['ts-drawer-close']} aria-label="Закрити" onClick={onClose}>
            {Icons.close}
          </button>
          <button type="button" className={styles['ts-drawer-share']} onClick={onShare}>
            <span className={styles['ts-drawer-share-i']}>{Icons.share}</span>
            <span>{shareNote ?? 'Поділитися'}</span>
          </button>
        </header>

        <div className={styles['ts-drawer-scroll']}>
        <div className={styles['ts-drawer-body']}>
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
                <span className={styles['ts-detail-deadline']}>{formatTaskDeadline(task.deadline)}</span>
              ) : (
                <span className={styles['ts-detail-empty']}>—</span>
              )}
            </DetailRow>

            <DetailRow
              label="Відповідальний"
              ariaLabel="Відповідальний"
              buttonRef={assigneeRef}
              onClick={() => togglePicker('assignee')}
            >
              <AssigneeCell assigneeId={task.assigneeId} />
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

        <footer className={styles['ts-drawer-footer']}>
          <SubtasksSection
            subtasks={task.subtasks}
            onChange={(subtasks) => patch({ subtasks })}
            onOpenSubtask={onOpenSubtask}
          />
          <ChecklistSection checkItems={task.checkItems} onChange={(checkItems) => patch({ checkItems })} />

          <CommentsSection
            taskId={task.id}
            comments={task.comments}
            onChange={(comments) => patch({ comments })}
          />
        </footer>
        </div>

        {picker === 'deadline' ? (
          <TaskDeadlinePicker
            open
            anchorRef={deadlineRef}
            valueIso={task.deadline}
            onClose={() => setPicker(null)}
            onSelectIso={(iso) => patch({ deadline: iso })}
          />
        ) : null}

        {picker && picker !== 'deadline' ? (
          <TaskPickerPopover
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
            clearOption={
              picker === 'priority'
                ? {
                    id: '__none__',
                    label: 'Clear',
                    selected: task.priority === null,
                  }
                : undefined
            }
            items={
              picker === 'status'
                ? statusPickerItems(task.status)
                : picker === 'priority'
                  ? priorityPickerItems(task.priority)
                  : picker === 'assignee'
                    ? assigneePickerItems(task.assigneeId)
                    : projectPickerItems(task.projectId)
            }
            onClose={() => setPicker(null)}
            onSelect={(id) => {
              if (picker === 'status') patch({ status: id as Status });
              if (picker === 'priority') patch({ priority: id === '__none__' ? null : (id as Priority) });
              if (picker === 'assignee') patch({ assigneeId: id === '__none__' ? null : id });
              if (picker === 'project') patch({ projectId: id === '__none__' ? null : id });
            }}
          />
        ) : null}
      </aside>
    </>,
    document.body,
  );
}
