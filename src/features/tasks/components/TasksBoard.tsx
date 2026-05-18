import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { formatDeadlineShort, isDeadlineToday, isTaskOverdue } from '../groupTasks';
import type { Task, TaskPriority, TaskStatus } from '../types';
import { PRIORITY_LABEL, STATUS_LABEL } from '../taskCopy';
import styles from '../tasks.module.css';

/* ─── constants ─────────────────────────────────────────────── */

const STATUS_BADGE_LABEL: Record<TaskStatus, string> = {
  todo: 'Новий',
  in_progress: 'В роботі',
  review: 'Ревью',
  done: 'Готово',
};

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
const PRIORITY_OPTIONS: TaskPriority[] = ['urgent', 'high', 'normal', 'low'];

/** Круговий індикатор «наскільки статус заповнений» (Notion / ClickUp-подібно). */
function StatusProgressGlyph({ status, size = 15 }: { status: TaskStatus; size?: number }) {
  const vb = 15;
  const sw = 2;
  const cx0 = vb / 2;
  const cy0 = vb / 2;
  const r = (vb - sw) / 2;
  const circ = 2 * Math.PI * r;
  const frac = status === 'todo' ? 0 : status === 'in_progress' ? 0.38 : status === 'review' ? 0.72 : 1;
  const dash = frac * circ;

  const stroke =
    status === 'todo'
      ? 'var(--txt-4)'
      : status === 'in_progress'
        ? '#fbbf24'
        : status === 'review'
          ? '#60a5fa'
          : '#34d399';

  if (status === 'done') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} className={styles['ts-st-glyph']} aria-hidden>
        <circle cx={cx0} cy={cy0} r={r} fill="none" stroke={stroke} strokeWidth={sw} opacity={0.35} />
        <circle cx={cx0} cy={cy0} r={r - sw * 0.35} fill={stroke} opacity={0.92} />
        <polyline
          points="4.5,7.6 7.05,10 11.35,5.15"
          fill="none"
          stroke="var(--bg)"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} className={styles['ts-st-glyph']} aria-hidden>
      <circle cx={cx0} cy={cy0} r={r} fill="none" stroke={stroke} strokeWidth={sw} opacity={0.22} />
      <circle
        cx={cx0}
        cy={cy0}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx0} ${cy0})`}
      />
    </svg>
  );
}

function statusBadgeClass(s: TaskStatus): string {
  if (s === 'todo') return styles['sb-todo'];
  if (s === 'in_progress') return styles['sb-progress'];
  if (s === 'review') return styles['sb-review'];
  return styles['sb-done'];
}

function priorityPillClass(p: TaskPriority): string {
  if (p === 'urgent') return styles['pp-urgent'];
  if (p === 'high') return styles['pp-high'];
  if (p === 'normal') return styles['pp-normal'];
  return styles['pp-low'];
}

/* ─── outside click hook ─────────────────────────────────────── */

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [active, ref, cb]);
}

/* ─── inline pickers ─────────────────────────────────────────── */

function StatusCell({
  task,
  onChange,
  compact,
  glyphSize,
}: {
  task: Task;
  onChange: (t: Task) => void;
  compact?: boolean;
  glyphSize?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);
  return (
    <span ref={ref} className={styles['ts-cell-pick']}>
      <button
        type="button"
        className={cx(
          styles['ts-st-badge'],
          styles['ts-st-badge-inline'],
          statusBadgeClass(task.status),
          compact && styles['ts-st-compact'],
        )}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title={STATUS_LABEL[task.status]}
      >
        <StatusProgressGlyph status={task.status} size={glyphSize} />
        {!compact ? <span>{STATUS_BADGE_LABEL[task.status]}</span> : null}
      </button>
      {open && (
        <span className={styles['ts-pick-menu']}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={cx(styles['ts-pick-opt'], styles['ts-pick-opt-row'], statusBadgeClass(s), task.status === s && styles['pick-on'])}
              onClick={(e) => { e.stopPropagation(); onChange({ ...task, status: s }); setOpen(false); }}
            >
              <StatusProgressGlyph status={s} size={glyphSize ?? 15} />
              {STATUS_BADGE_LABEL[s]}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

function PriorityCell({ task, onChange, compact }: { task: Task; onChange: (t: Task) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);
  return (
    <span ref={ref} className={styles['ts-cell-pick']}>
      <button
        type="button"
        className={cx(styles['ts-pri-pill'], priorityPillClass(task.priority), compact && styles['ts-pri-clickup'])}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title={PRIORITY_LABEL[task.priority]}
      >
        {compact ? (
          <>
            <span className={styles['ts-pri-flag']} aria-hidden>{Icons.flag}</span>
            <span>{PRIORITY_LABEL[task.priority]}</span>
          </>
        ) : (
          PRIORITY_LABEL[task.priority]
        )}
      </button>
      {open && (
        <span className={styles['ts-pick-menu']}>
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              className={cx(styles['ts-pick-opt'], priorityPillClass(p), task.priority === p && styles['pick-on'])}
              onClick={(e) => { e.stopPropagation(); onChange({ ...task, priority: p }); setOpen(false); }}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

function DeadlineCell({ task, onChange }: { task: Task; onChange: (t: Task) => void }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overdue = isTaskOverdue(task);
  const todayDl = isDeadlineToday(task);

  const open = () => {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      try { inputRef.current?.showPicker?.(); } catch { /* ok */ }
    }, 30);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        className={styles['ts-dl-input']}
        defaultValue={task.deadline ?? ''}
        onChange={(e) => onChange({ ...task, deadline: e.target.value || null })}
        onBlur={() => setEditing(false)}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  return (
    <button
      type="button"
      className={cx(
        styles['ts-dl-btn'],
        overdue && styles.overdue,
        todayDl && !overdue && styles['dl-today'],
      )}
      onClick={(e) => { e.stopPropagation(); open(); }}
    >
      {formatDeadlineShort(task.deadline)}
    </button>
  );
}

/* ─── subtask expansion ──────────────────────────────────────── */

function SubtaskList({
  task,
  onChange,
  dateLayout,
}: {
  task: Task;
  onChange: (t: Task) => void;
  dateLayout?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const draftRef = useRef<HTMLInputElement>(null);

  const toggleSub = (id: string) =>
    onChange({ ...task, subtasks: task.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) });

  const commitDraft = () => {
    const title = draft.trim();
    if (!title) return;
    onChange({ ...task, subtasks: [...task.subtasks, { id: `sub-${Date.now()}`, title, done: false }] });
    setDraft('');
    draftRef.current?.focus();
  };

  const skipCells = (
    <>
      <span className={styles['ts-sub-date-skip']} aria-hidden />
      <span className={styles['ts-sub-date-skip']} aria-hidden />
      <span className={styles['ts-sub-date-skip']} aria-hidden />
      <span className={styles['ts-sub-date-skip']} aria-hidden />
    </>
  );

  if (dateLayout) {
    return (
      <div className={styles['ts-subs-date']}>
        {task.subtasks.map((s) => (
          <div key={s.id} className={styles['ts-sub-date-row']}>
            <span className={styles['ts-sub-date-gutter']} aria-hidden />
            <span className={styles['ts-sub-date-gutter']} aria-hidden />
            <span className={styles['ts-sub-date-gutter']} aria-hidden />
            <div className={styles['ts-sub-date-main']}>
              <input
                type="checkbox"
                className={styles['ts-sub-date-check']}
                checked={s.done}
                onChange={() => toggleSub(s.id)}
              />
              <span className={cx(styles['ts-sub-date-text'], s.done && styles['ts-sub-done'])}>{s.title}</span>
            </div>
            {skipCells}
          </div>
        ))}
        <div className={styles['ts-sub-date-row']}>
          <span className={styles['ts-sub-date-gutter']} aria-hidden />
          <span className={styles['ts-sub-date-gutter']} aria-hidden />
          <span className={styles['ts-sub-date-gutter']} aria-hidden />
          <div className={styles['ts-sub-date-main']}>
            <span className={styles['ts-sub-date-check-ph']} aria-hidden />
            <input
              ref={draftRef}
              type="text"
              className={styles['ts-sub-draft-date']}
              placeholder="+ Підзадача"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitDraft(); }
                if (e.key === 'Escape') setDraft('');
              }}
            />
          </div>
          {skipCells}
        </div>
      </div>
    );
  }

  return (
    <div className={styles['ts-subs']}>
      {task.subtasks.map((s) => (
        <div key={s.id} className={styles['ts-sub-r']}>
          <span className={styles['ts-sub-indent']} />
          <input
            type="checkbox"
            className={styles['ts-sub-check']}
            checked={s.done}
            onChange={() => toggleSub(s.id)}
          />
          <span className={cx(styles['ts-sub-text'], s.done && styles['ts-sub-done'])}>{s.title}</span>
        </div>
      ))}
      <div className={styles['ts-sub-r']}>
        <span className={styles['ts-sub-indent']} />
        <input
          ref={draftRef}
          type="text"
          className={styles['ts-sub-draft']}
          placeholder="+ Підзадача"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitDraft(); }
            if (e.key === 'Escape') setDraft('');
          }}
        />
      </div>
    </div>
  );
}

/* ─── chevron icons ──────────────────────────────────────────── */

const TriRight = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
    <path d="M3 2l4 3-4 3V2z" />
  </svg>
);

const TriDown = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
    <path d="M2 3h6L5 8 2 3z" />
  </svg>
);

/* ─── public types ───────────────────────────────────────────── */

export interface TaskSection {
  id: string;
  label: string;
  meta?: string;
  tone?: 'overdue';
}

export type TasksGroupingKind = 'date' | 'project' | 'archive';

interface TasksBoardProps {
  groupingKind: TasksGroupingKind;
  /** Вкладка «За датами»: без верхньої плашки; «+» у заголовку кожної групи при hover */
  dateTabLayout?: boolean;
  sections: TaskSection[];
  tasksBySection: Map<string, Task[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange?: (task: Task) => void;
  onAdd?: (sectionId: string, title: string) => void;
  onAddTeam?: () => void;
  emptyMessage?: string;
}

/* ─── board ──────────────────────────────────────────────────── */

export function TasksBoard({
  groupingKind,
  dateTabLayout = false,
  sections,
  tasksBySection,
  selectedId,
  onSelect,
  onChange,
  onAdd,
  onAddTeam,
  emptyMessage,
}: TasksBoardProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() =>
    groupingKind === 'date' ? new Set(['later', 'no_date']) : new Set(),
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [addTitle, setAddTitle] = useState('');
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (groupingKind === 'date') {
      setCollapsed(new Set(['later', 'no_date']));
    } else {
      setCollapsed(new Set());
    }
  }, [groupingKind]);

  const flatCount = sections.reduce((n, s) => n + (tasksBySection.get(s.id)?.length ?? 0), 0);

  if (!flatCount && !sections.length) {
    return <div className={styles['ts-empty']}>{emptyMessage ?? 'Немає задач у цьому розділі.'}</div>;
  }

  const toggleSection = (id: string) =>
    setCollapsed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleExpand = (id: string) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const startAdd = (sectionId: string) => {
    setCollapsed((prev) => {
      if (!prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.delete(sectionId);
      return next;
    });
    setAddingSection(sectionId);
    setAddTitle('');
    setTimeout(() => addRef.current?.focus(), 40);
  };

  const commitAdd = (sectionId: string) => {
    if (addTitle.trim() && onAdd) onAdd(sectionId, addTitle.trim());
    setAddingSection(null);
    setAddTitle('');
  };

  const cancelAdd = () => { setAddingSection(null); setAddTitle(''); };
  const firstSectionId = sections[0]?.id;

  return (
    <div className={cx(styles['ts-board'], dateTabLayout && styles['ts-board-date'])}>
      {!dateTabLayout ? (
        <div className={styles['ts-board-head']}>
          <div className={styles['ts-board-copy']}>
            <span className={styles['ts-board-kicker']}>Список задач</span>
            <span className={styles['ts-board-sub']}>
              {flatCount} активних · статус, напрямок, пріоритет і дата в одному рядку
            </span>
          </div>
          <div className={styles['ts-board-actions']}>
            <button type="button" className={styles['ts-action-btn']} onClick={onAddTeam}>
              Додати в команду
            </button>
            <button
              type="button"
              className={cx(styles['ts-action-btn'], styles['primary'])}
              onClick={() => firstSectionId && startAdd(firstSectionId)}
              disabled={!firstSectionId}
            >
              <span className={styles['ts-new-plus']}>+</span>
              Додати задачу
            </button>
          </div>
        </div>
      ) : null}
      <div className={styles['ts-sheet-v2']}>

        {sections.map((section) => {
          const list = tasksBySection.get(section.id) ?? [];
          const isOpen = !collapsed.has(section.id);

          return (
            <section key={section.id} className={styles['ts-sec']}>
              <div
                className={cx(
                  styles['ts-sec-toolbar'],
                  dateTabLayout && onAdd && styles['ts-sec-toolbar-with-add'],
                )}
              >
                <button
                  type="button"
                  className={cx(
                    styles['ts-sec-head'],
                    section.tone === 'overdue' && styles['ts-sec-overdue'],
                    dateTabLayout && section.id === 'tomorrow' && styles['ts-sec-muted'],
                  )}
                  data-sec={dateTabLayout ? section.id : undefined}
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                >
                  <span className={styles['ts-sec-chev']} aria-hidden>
                    {isOpen ? <TriDown /> : <TriRight />}
                  </span>
                  <span className={styles['ts-sec-label']}>{section.label}</span>
                  {section.meta ? <span className={styles['ts-sec-meta']}>{section.meta}</span> : null}
                  <span className={styles['ts-sec-count']}>{list.length}</span>
                </button>
                {dateTabLayout && onAdd ? (
                  <button
                    type="button"
                    className={styles['ts-sec-toolbar-add']}
                    title={`Додати задачу — ${section.label}`}
                    aria-label={`Додати задачу в групу «${section.label}»`}
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      startAdd(section.id);
                    }}
                  >
                    +
                  </button>
                ) : null}
              </div>

              {isOpen ? (
                <div className={styles['ts-sec-cards']}>
                  <div
                    className={cx(styles['ts-list-head'], dateTabLayout && styles['ts-list-head-clickup'])}
                    aria-hidden={dateTabLayout ? undefined : true}
                  >
                    {dateTabLayout ? (
                      <>
                        <span aria-hidden />
                        <span aria-hidden />
                        <span aria-hidden />
                        <span>Назва</span>
                        <span>Пріоритет</span>
                        <span>Термін</span>
                        <span>Викон.</span>
                        <span>Напрямок</span>
                      </>
                    ) : (
                      <>
                        <span />
                        <span>Статус</span>
                        <span>Задача</span>
                        <span>Напрямок / проєкт</span>
                        <span>Пріоритет</span>
                        <span>Дата</span>
                        <span>Відповідальний</span>
                      </>
                    )}
                  </div>
                  {list.map((task) => {
                    const isCardExpanded = expanded.has(task.id);
                    const hasSubs = task.subtasks.length > 0;
                    const overdue = isTaskOverdue(task);

                    return (
                      <div
                        key={task.id}
                        className={cx(
                          styles['ts-card-wrap'],
                          selectedId === task.id && styles['wrap-on'],
                          overdue && selectedId !== task.id && styles['wrap-overdue'],
                        )}
                      >
                        <div className={styles['ts-card']}>
                          {dateTabLayout ? (
                            <>
                              {hasSubs || isCardExpanded ? (
                                <button
                                  type="button"
                                  className={cx(
                                    styles['ts-card-exp'],
                                    (hasSubs || isCardExpanded) && styles['has-subs'],
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(task.id);
                                  }}
                                  title="Підзадачі"
                                >
                                  {isCardExpanded ? <TriDown /> : <TriRight />}
                                </button>
                              ) : (
                                <span className={styles['ts-card-exp-ph']} aria-hidden />
                              )}
                              {onChange ? (
                                <span className={styles['ts-card-done']}>
                                  <input
                                    type="checkbox"
                                    className={styles['ts-card-done-check']}
                                    checked={task.status === 'done'}
                                    aria-label="Позначити виконаною"
                                    title="Виконано"
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      onChange({ ...task, status: e.target.checked ? 'done' : 'todo' });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </span>
                              ) : (
                                <span className={styles['ts-card-done']} aria-hidden />
                              )}

                              <span className={styles['ts-card-status']}>
                                {onChange ? (
                                  <StatusCell task={task} onChange={onChange} compact glyphSize={13} />
                                ) : (
                                  <span
                                    className={cx(
                                      styles['ts-st-badge'],
                                      styles['ts-st-badge-inline'],
                                      styles['ts-st-compact'],
                                      statusBadgeClass(task.status),
                                    )}
                                  >
                                    <StatusProgressGlyph status={task.status} size={13} />
                                  </span>
                                )}
                              </span>
                              <div className={styles['ts-card-title-cell']}>
                                <button
                                  type="button"
                                  className={styles['ts-card-title']}
                                  onClick={() => onSelect(task.id)}
                                >
                                  {task.title || (
                                    <span className={styles['ts-title-empty']}>Без назви</span>
                                  )}
                                </button>
                                {hasSubs ? (
                                  <span className={styles['ts-sub-frac']} title="Підзадачі">
                                    {task.subtasks.filter((st) => st.done).length}/{task.subtasks.length}
                                  </span>
                                ) : null}
                              </div>
                              <span className={styles['ts-card-pri']}>
                                {onChange ? (
                                  <PriorityCell task={task} onChange={onChange} compact={dateTabLayout} />
                                ) : (
                                  <span className={cx(styles['ts-pri-pill'], priorityPillClass(task.priority))}>
                                    {PRIORITY_LABEL[task.priority]}
                                  </span>
                                )}
                              </span>
                              <span className={styles['ts-card-dl']}>
                                {onChange ? (
                                  <DeadlineCell task={task} onChange={onChange} />
                                ) : (
                                  <span className={cx(styles['ts-dl-chip'], overdue && styles.overdue)}>
                                    {formatDeadlineShort(task.deadline)}
                                  </span>
                                )}
                              </span>
                              <span className={styles['ts-card-av']} title={task.assignee.name}>
                                <Avatar name={task.assignee.name} hue={task.assignee.hue} size="sm" />
                              </span>
                              <span className={styles['ts-card-proj']}>
                                {task.projectName || 'Без напрямку'}
                              </span>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className={cx(styles['ts-card-exp'], (hasSubs || isCardExpanded) && styles['has-subs'])}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(task.id);
                                }}
                                title="Підзадачі"
                              >
                                {isCardExpanded ? <TriDown /> : <TriRight />}
                              </button>

                              <span className={styles['ts-card-status']}>
                                {onChange ? (
                                  <StatusCell task={task} onChange={onChange} compact={dateTabLayout} />
                                ) : (
                                  <span
                                    className={cx(
                                      styles['ts-st-badge'],
                                      styles['ts-st-badge-inline'],
                                      statusBadgeClass(task.status),
                                    )}
                                  >
                                    <StatusProgressGlyph status={task.status} />
                                    <span>{STATUS_BADGE_LABEL[task.status]}</span>
                                  </span>
                                )}
                              </span>
                              <button
                                type="button"
                                className={styles['ts-card-title']}
                                onClick={() => onSelect(task.id)}
                              >
                                {task.title || (
                                  <span className={styles['ts-title-empty']}>Без назви</span>
                                )}
                              </button>
                              <span className={styles['ts-card-proj']}>
                                {task.projectName || 'Без напрямку'}
                              </span>
                              <span className={styles['ts-card-pri']}>
                                {onChange ? (
                                  <PriorityCell task={task} onChange={onChange} compact={dateTabLayout} />
                                ) : (
                                  <span className={cx(styles['ts-pri-pill'], priorityPillClass(task.priority))}>
                                    {PRIORITY_LABEL[task.priority]}
                                  </span>
                                )}
                              </span>
                              <span className={styles['ts-card-dl']}>
                                {onChange ? (
                                  <DeadlineCell task={task} onChange={onChange} />
                                ) : (
                                  <span className={cx(styles['ts-dl-chip'], overdue && styles.overdue)}>
                                    {formatDeadlineShort(task.deadline)}
                                  </span>
                                )}
                              </span>
                              <span className={styles['ts-card-av']} title={task.assignee.name}>
                                <Avatar name={task.assignee.name} hue={task.assignee.hue} size="sm" />
                              </span>
                            </>
                          )}
                        </div>

                        {isCardExpanded && onChange ? (
                          <SubtaskList task={task} onChange={onChange} dateLayout={dateTabLayout} />
                        ) : null}
                      </div>
                    );
                  })}

                  {addingSection === section.id ? (
                    <div className={cx(styles['ts-add-card'], dateTabLayout && styles['ts-add-card-date'])}>
                      {dateTabLayout ? (
                        <>
                          <span className={styles['ts-add-ph-exp']} aria-hidden />
                          <span className={styles['ts-add-ph-done']} aria-hidden />
                        </>
                      ) : null}
                      {!dateTabLayout ? <span className={styles['ts-card-exp']} aria-hidden /> : null}
                      <span className={styles['ts-add-status']}>Новий</span>
                      <input
                        ref={addRef}
                        type="text"
                        className={styles['ts-add-input-v2']}
                        placeholder="Назва задачі…"
                        value={addTitle}
                        onChange={(e) => setAddTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitAdd(section.id);
                          if (e.key === 'Escape') cancelAdd();
                        }}
                        onBlur={() => commitAdd(section.id)}
                      />
                    </div>
                  ) : dateTabLayout && onAdd ? (
                    <button type="button" className={styles['ts-add-row-clickup']} onClick={() => startAdd(section.id)}>
                      <span className={styles['ts-add-row-inner']}>
                        <span className={styles['ts-add-row-plus']} aria-hidden>
                          +
                        </span>
                        Додати задачу
                      </span>
                    </button>
                  ) : !dateTabLayout ? (
                    <button
                      type="button"
                      className={styles['ts-new-btn-v2']}
                      onClick={() => startAdd(section.id)}
                    >
                      <span className={styles['ts-new-plus']}>+</span>
                      Додати задачу
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
