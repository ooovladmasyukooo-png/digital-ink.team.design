import { useMemo, useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { ASSIGNEE_OPTIONS, DIRECTION_OPTIONS } from '../data';
import { formatDeadlineShort, parseYmd } from '../groupTasks';
import { PRIORITY_LABEL, STATUS_LABEL } from '../taskCopy';
import type { TaskAssignee, TaskPriority, TaskStatus } from '../types';
import { CellPopover } from './CellPopover';
import { TaskStatusDot } from './TaskStatusDot';
import styles from '../tasks.module.css';

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
const PRIORITY_OPTIONS: TaskPriority[] = ['urgent', 'high', 'normal', 'low'];

function ymdFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysYmd(ymd: string | null, delta: number): string {
  const base = ymd ? parseYmd(ymd) : new Date();
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return ymdFromDate(d);
}

interface PopMenuProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  label: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  align?: 'start' | 'center';
  children: React.ReactNode;
}

function PopMenu({ open, onOpenChange, label, trigger, triggerClassName, align, children }: PopMenuProps) {
  return (
    <CellPopover open={open} onOpenChange={onOpenChange} label={label} trigger={trigger} triggerClassName={triggerClassName} align={align}>
      <div className={styles['pop-menu']}>{children}</div>
    </CellPopover>
  );
}

export function StatusPicker({
  status,
  onChange,
}: {
  status: TaskStatus;
  onChange: (s: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PopMenu
      open={open}
      onOpenChange={setOpen}
      label="Статус"
      align="center"
      triggerClassName={styles['cell-btn-status']}
      trigger={<TaskStatusDot status={status} />}
    >
      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          type="button"
          className={styles['pop-item']}
          data-active={s === status ? '' : undefined}
          onClick={() => {
            onChange(s);
            setOpen(false);
          }}
        >
          <TaskStatusDot status={s} />
          <span>{STATUS_LABEL[s]}</span>
        </button>
      ))}
    </PopMenu>
  );
}

export function PriorityPicker({
  priority,
  onChange,
}: {
  priority: TaskPriority | null;
  onChange: (p: TaskPriority) => void;
}) {
  const [open, setOpen] = useState(false);
  const showLabel = priority === 'urgent' || priority === 'high';
  return (
    <PopMenu
      open={open}
      onOpenChange={setOpen}
      label="Пріоритет"
      triggerClassName={styles['cell-btn-priority']}
      trigger={
        <>
          <span className={styles['flag']} data-priority={priority ?? 'none'}>
            {Icons.flag}
          </span>
          {showLabel && priority ? <span className={styles['pri-label']} data-priority={priority}>{PRIORITY_LABEL[priority]}</span> : null}
        </>
      }
    >
      {PRIORITY_OPTIONS.map((p) => (
        <button
          key={p}
          type="button"
          className={styles['pop-item']}
          data-active={p === priority ? '' : undefined}
          onClick={() => {
            onChange(p);
            setOpen(false);
          }}
        >
          <span className={styles['flag']} data-priority={p}>
            {Icons.flag}
          </span>
          <span>{PRIORITY_LABEL[p]}</span>
        </button>
      ))}
    </PopMenu>
  );
}

export function DeadlinePicker({
  deadline,
  overdue,
  onChange,
}: {
  deadline: string | null;
  overdue?: boolean;
  onChange: (d: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const quick = useMemo(
    () => [
      { label: 'Сьогодні', value: ymdFromDate(new Date()) },
      { label: 'Завтра', value: addDaysYmd(null, 1) },
      { label: 'Через тиждень', value: addDaysYmd(null, 7) },
    ],
    [],
  );

  return (
    <PopMenu
      open={open}
      onOpenChange={setOpen}
      label="Термін"
      triggerClassName={styles['cell-btn-deadline']}
      trigger={<span data-overdue={overdue ? '' : undefined}>{formatDeadlineShort(deadline)}</span>}
    >
      {quick.map((q) => (
        <button
          key={q.label}
          type="button"
          className={styles['pop-item']}
          onClick={() => {
            onChange(q.value);
            setOpen(false);
          }}
        >
          {q.label}
        </button>
      ))}
      <button
        type="button"
        className={styles['pop-item']}
        onClick={() => {
          onChange(null);
          setOpen(false);
        }}
      >
        Без дати
      </button>
    </PopMenu>
  );
}

export function AssigneePicker({
  assignee,
  onChange,
}: {
  assignee: TaskAssignee;
  onChange: (a: TaskAssignee) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PopMenu
      open={open}
      onOpenChange={setOpen}
      label="Виконавець"
      align="center"
      triggerClassName={styles['cell-btn-assignee']}
      trigger={<Avatar name={assignee.name} hue={assignee.hue} size="sm" />}
    >
      {ASSIGNEE_OPTIONS.map((a) => (
        <button
          key={a.id}
          type="button"
          className={styles['pop-item']}
          data-active={a.id === assignee.id ? '' : undefined}
          onClick={() => {
            onChange(a);
            setOpen(false);
          }}
        >
          <Avatar name={a.name} hue={a.hue} size="sm" />
          <span>{a.name}</span>
        </button>
      ))}
    </PopMenu>
  );
}

export function DirectionPicker({
  projectName,
  onChange,
}: {
  projectId: string;
  projectName: string;
  onChange: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PopMenu
      open={open}
      onOpenChange={setOpen}
      label="Напрямок"
      triggerClassName={styles['cell-btn-direction']}
      trigger={<span className={styles['direction']}>{projectName}</span>}
    >
      {DIRECTION_OPTIONS.map((d) => (
        <button
          key={d.id}
          type="button"
          className={styles['pop-item']}
          data-active={d.name === projectName ? '' : undefined}
          onClick={() => {
            onChange(d.id, d.name);
            setOpen(false);
          }}
        >
          <span className={styles['direction']}>{d.name}</span>
        </button>
      ))}
    </PopMenu>
  );
}
