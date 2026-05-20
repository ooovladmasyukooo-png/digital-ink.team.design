import type { ReactNode } from 'react';
import { Avatar } from '../../shared/components/Avatar';
import { Icons } from '../../shared/components/Icon';
import { Chip } from '../../shared/components/Chip';
import { cx } from '../../shared/styles/cx';
import { projects } from '../projects2/data';
import { teamMembers } from '../team/data';
import { PRIORITIES, STATUS_META, PRIORITY_OPTIONS, STATUS_OPTIONS } from './constants';
import type { TaskPickerItem } from './components/TaskPickerPopover';
import type { Priority, Status } from './types';
import styles from './tasks.module.css';

const STATUS_ICONS: Record<Status, ReactNode> = {
  inbox: Icons.inbox,
  new: Icons.spark,
  doing: Icons.play,
  control: Icons.eye,
  done: Icons.check,
  archive: Icons.archive,
};

export const teamById = Object.fromEntries(teamMembers.map((m) => [m.id, m]));
export const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

function StatusLabel({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cx(
        styles['ts-status'],
        size === 'md' ? styles['ts-status-md'] : styles['ts-status-sm'],
        styles[`ts-status-${meta.tone}`]
      )}
    >
      <span className={styles['ts-status-i']}>{STATUS_ICONS[status]}</span>
      <span className={styles['ts-status-t']}>{meta.label}</span>
    </span>
  );
}

export function statusPickerItems(current: Status): TaskPickerItem[] {
  return STATUS_OPTIONS.map((id) => ({
    id,
    selected: id === current,
    searchText: STATUS_META[id].label,
    label: <StatusLabel status={id} size="md" />,
  }));
}

export function priorityPickerItems(current: Priority | null): TaskPickerItem[] {
  return PRIORITY_OPTIONS.map((id) => ({
    id,
    selected: id === current,
    searchText: PRIORITIES[id].label,
    label: (
      <Chip tone={PRIORITIES[id].tone}>
        <span className={styles['ts-pri-flag']} aria-hidden>
          {Icons.flag}
        </span>
        {PRIORITIES[id].label}
      </Chip>
    ),
  }));
}

export function assigneePickerItems(current: string[]): TaskPickerItem[] {
  return teamMembers.map((m) => ({
    id: m.id,
    selected: current.includes(m.id),
    searchText: m.name,
    label: (
      <span className={styles['ts-pick-person']}>
        <Avatar name={m.name} hue={m.hue} size="sm" />
        <span>{m.name}</span>
      </span>
    ),
  }));
}

export function assigneePickerClearOption(current: string[]) {
  return {
    id: '__none__',
    selected: current.length === 0,
    label: <span className="muted xs">Без відповідальних</span>,
  };
}

export function toggleAssigneeIds(current: string[], id: string): string[] {
  if (id === '__none__') return [];
  if (current.includes(id)) return current.filter((x) => x !== id);
  return [...current, id];
}

export function projectPickerItems(current: string | null): TaskPickerItem[] {
  const none: TaskPickerItem = {
    id: '__none__',
    selected: current === null,
    searchText: 'без проєкту',
    label: <span className="muted xs">Без проєкту</span>,
  };
  const list = projects.map((p) => ({
    id: p.id,
    selected: current === p.id,
    searchText: p.name,
    label: (
      <span className={styles['ts-pick-person']}>
        <Avatar name={p.name} hue={p.hue} size="sm" />
        <span>{p.name}</span>
      </span>
    ),
  }));
  return [none, ...list];
}

export function StatusBadge({ status }: { status: Status }) {
  return <StatusLabel status={status} size="sm" />;
}

export function SubtaskStatusIcon({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cx(
        styles['ts-status'],
        styles['ts-status-sm'],
        styles['ts-subtask-status-only'],
        styles[`ts-status-${meta.tone}`],
      )}
    >
      <span className={styles['ts-status-i']}>{STATUS_ICONS[status]}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority | null }) {
  if (!priority) return <span className={styles['ts-empty']}>—</span>;
  const meta = PRIORITIES[priority];
  return (
    <Chip tone={meta.tone}>
      <span className={styles['ts-pri-flag']} aria-hidden>
        {Icons.flag}
      </span>
      {meta.short}
    </Chip>
  );
}

export function AssigneeCell({ assigneeIds }: { assigneeIds: string[] }) {
  const members = assigneeIds.map((id) => teamById[id]).filter(Boolean);
  if (members.length === 0) return <span className={styles['ts-empty']}>—</span>;

  const title = members.map((m) => m.name).join(', ');
  const visible = members.slice(0, 3);
  const extra = members.length - visible.length;

  return (
    <span className={styles['ts-assignees']} title={title}>
      {visible.map((m) => (
        <span key={m.id} className={styles['ts-assignees-av']}>
          <Avatar name={m.name} hue={m.hue} size="sm" />
        </span>
      ))}
      {extra > 0 ? <span className={styles['ts-assignees-more']}>+{extra}</span> : null}
    </span>
  );
}

export function ProjectCell({ projectId }: { projectId: string | null }) {
  if (!projectId) return <span className={styles['ts-empty']}>—</span>;
  const p = projectById[projectId];
  if (!p) return <span className={styles['ts-empty']}>—</span>;
  return (
    <span className={styles['ts-project']} title={p.name}>
      <Avatar name={p.name} hue={p.hue} size="sm" />
      <span className={styles['ts-project-name']}>{p.name}</span>
    </span>
  );
}

export const columnIcons = {
  status: Icons.sun,
  name: (
    <span className="ts-col-aa" aria-hidden>
      Aa
    </span>
  ),
  priority: (
    <span className="ts-col-dot" aria-hidden>
      ◎
    </span>
  ),
  deadline: Icons.calendar,
  assignee: Icons.team,
  project: Icons.briefcase,
};
