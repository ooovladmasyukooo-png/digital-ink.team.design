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
import { isCompletedStatus } from '../designBriefCompletion';
import styles from '../designBrief.module.css';
import type { Priority, Status, DesignBrief, DesignBriefPatch } from '../types';
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
import { ChecklistSection } from './ChecklistSection';
import { CommentsSection } from './CommentsSection';
import { DesignBriefDeadlinePicker } from './DesignBriefDeadlinePicker';
import { DesignBriefPickerPopover } from './DesignBriefPickerPopover';
import {
  DesignBriefCopyTextBlock,
  DesignBriefFormatSizeRows,
  DesignBriefReferencesSection,
} from './DesignBriefCreativeFields';

type PickerField = 'status' | 'priority' | 'deadline' | 'assignee' | 'project' | null;

export interface DesignBriefDetailContentProps {
  brief: DesignBrief;
  onUpdate: (id: string, patch: DesignBriefPatch) => void;
  onOpenSubtask: (subtaskId: string) => void;
  parentBrief?: Pick<DesignBrief, 'id' | 'title'>;
  parentBriefLabel?: string;
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
    <div className={styles['db-detail-row']}>
      <span className={styles['db-detail-k']}>{label}</span>
      <button ref={buttonRef} type="button" className={styles['db-detail-v']} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </button>
    </div>
  );
}

export function DesignBriefDetailContent({
  brief,
  onUpdate,
  onOpenSubtask,
  parentBrief,
  parentBriefLabel = 'Головне ТЗ',
  onOpenParentTask,
  scrollClassName,
  bodyClassName,
  footerClassName,
}: DesignBriefDetailContentProps) {
  const [picker, setPicker] = useState<PickerField>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const deadlineRef = useRef<HTMLButtonElement>(null);
  const assigneeRef = useRef<HTMLButtonElement>(null);
  const projectRef = useRef<HTMLButtonElement>(null);

  const patch = useCallback((p: DesignBriefPatch) => onUpdate(brief.id, p), [onUpdate, brief.id]);

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
  }, [brief.id, brief.title, brief.description]);

  return (
    <>
      <div className={scrollClassName ?? styles['db-drawer-scroll']}>
        <div className={bodyClassName ?? styles['db-drawer-body']}>
          <textarea
            ref={titleRef}
            className={styles['db-detail-title']}
            value={brief.title}
            rows={1}
            onChange={(e) => {
              patch({ title: e.target.value });
              syncTextareaHeight(e.target);
            }}
            onFocus={(e) => syncTextareaHeight(e.target)}
            aria-label="Заголовок задачі"
          />

          <div className={styles['db-detail-rows']}>
            <DetailRow
              label="Статус"
              ariaLabel={`Статус: ${STATUS_META[brief.status].label}`}
              buttonRef={statusRef}
              onClick={() => togglePicker('status')}
            >
              <StatusBadge status={brief.status} />
            </DetailRow>

            <DetailRow
              label="Пріоритет"
              ariaLabel={
                brief.priority ? `Пріоритет: ${PRIORITIES[brief.priority].label}` : 'Пріоритет не встановлено'
              }
              buttonRef={priorityRef}
              onClick={() => togglePicker('priority')}
            >
              <PriorityBadge priority={brief.priority} />
            </DetailRow>

            <DetailRow label="Дедлайн" ariaLabel="Дедлайн" buttonRef={deadlineRef} onClick={() => togglePicker('deadline')}>
              {brief.deadline ? (
                <span
                  className={cx(
                    styles['db-detail-deadline'],
                    isCompletedStatus(brief.status) &&
                      isCompletedAfterDeadline(brief.deadline, brief.completedAt) &&
                      styles['db-deadline-t-late'],
                  )}
                >
                  {formatTaskDeadline(brief.deadline)}
                  {brief.recurrenceRule ? (
                    <span className={styles['db-recur-mark']} aria-label="Повторювана задача">
                      {Icons.repeat}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className={styles['db-detail-empty']}>—</span>
              )}
            </DetailRow>

            <DetailRow
              label="Дизайнер"
              ariaLabel="Дизайнер"
              buttonRef={assigneeRef}
              onClick={() => togglePicker('assignee')}
            >
              <AssigneeCell assigneeIds={brief.assigneeIds} />
            </DetailRow>

            <DetailRow label="Проєкт" ariaLabel="Проєкт" buttonRef={projectRef} onClick={() => togglePicker('project')}>
              <ProjectCell projectId={brief.projectId} />
            </DetailRow>

            {!parentBrief ? (
              <DesignBriefFormatSizeRows format={brief.format} sizes={brief.sizes} onPatch={patch} />
            ) : null}

            {parentBrief && onOpenParentTask ? (
              <div className={styles['db-detail-row']}>
                <span className={styles['db-detail-k']}>{parentBriefLabel}</span>
                <button
                  type="button"
                  className={styles['db-detail-parent']}
                  onClick={onOpenParentTask}
                  aria-label={`Відкрити головну задачу: ${parentBrief.title}`}
                >
                  <span className={styles['db-detail-parent-t']}>{parentBrief.title}</span>
                  <span className={styles['db-detail-parent-i']} aria-hidden>
                    {Icons.openExternal}
                  </span>
                </button>
              </div>
            ) : null}
          </div>

          <div className={styles['db-detail-desc-block']}>
            <span className={styles['db-detail-k']}>Опис</span>
            <textarea
              ref={descRef}
              className={styles['db-detail-desc']}
              value={brief.description}
              placeholder="Додайте деталі, контекст, посилання…"
              rows={3}
              onChange={(e) => {
                patch({ description: e.target.value });
                syncTextareaHeight(e.target);
              }}
              aria-label="Опис задачі"
            />
          </div>

          {!parentBrief ? (
            <DesignBriefCopyTextBlock briefId={brief.id} copyVariants={brief.copyVariants} onPatch={patch} />
          ) : null}
        </div>

        {!parentBrief ? (
          <DesignBriefReferencesSection referenceLinks={brief.referenceLinks} onPatch={patch} />
        ) : null}

        <footer className={footerClassName ?? styles['db-drawer-footer']}>
          <ChecklistSection checkItems={brief.checkItems} onChange={(checkItems) => patch({ checkItems })} />
          <CommentsSection briefId={brief.id} comments={brief.comments} onChange={(comments) => patch({ comments })} />
        </footer>
      </div>

      {picker === 'deadline' ? (
        <DesignBriefDeadlinePicker
          open
          anchorRef={deadlineRef}
          valueIso={brief.deadline}
          recurrenceRule={brief.recurrenceRule}
          showRecurrence={!parentBrief}
          onClose={() => setPicker(null)}
          onSelectIso={(iso) => patch({ deadline: iso })}
          onRecurrenceChange={(rule) => patch({ recurrenceRule: rule })}
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
                  selected: brief.priority === null,
                }
              : picker === 'assignee'
                ? assigneePickerClearOption(brief.assigneeIds)
                : undefined
          }
          items={
            picker === 'status'
              ? statusPickerItems(brief.status)
              : picker === 'priority'
                ? priorityPickerItems(brief.priority)
                : picker === 'assignee'
                  ? assigneePickerItems(brief.assigneeIds)
                  : projectPickerItems(brief.projectId)
          }
          onClose={() => setPicker(null)}
          onSelect={(id) => {
            if (picker === 'status') patch({ status: id as Status });
            if (picker === 'priority') patch({ priority: id === '__none__' ? null : (id as Priority) });
            if (picker === 'assignee') patch({ assigneeIds: toggleAssigneeIds(brief.assigneeIds, id) });
            if (picker === 'project') patch({ projectId: id === '__none__' ? null : id });
          }}
        />
      ) : null}
    </>
  );
}
