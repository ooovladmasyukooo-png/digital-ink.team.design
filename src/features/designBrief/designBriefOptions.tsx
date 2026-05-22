import type { ReactNode } from 'react';
import { Avatar } from '../../shared/components/Avatar';
import { Icons } from '../../shared/components/Icon';
import { Chip } from '../../shared/components/Chip';
import { cx } from '../../shared/styles/cx';
import { projects } from '../projects2/data';
import { teamMembers } from '../team/data';
import { PRIORITIES, STAGE_LABELS, STATUS_META, PRIORITY_OPTIONS, STATUS_OPTIONS, type Stage } from './constants';
import type { TaskPickerItem } from './components/DesignBriefPickerPopover';
import type { Priority, Status } from './types';
import styles from './designBrief.module.css';

const STAGE_ORDER: Stage[] = ['todo', 'inprogress', 'complete'];

const STATUS_ICONS: Record<Status, ReactNode> = {
  new: Icons.spark,
  ready: Icons.play,
  in_design: Icons.tasks,
  approve: Icons.eye,
  done: Icons.check,
  closed: Icons.archive,
};

export const teamById = Object.fromEntries(teamMembers.map((m) => [m.id, m]));
export const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

function StatusLabel({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cx(
        styles['db-status'],
        size === 'md' ? styles['db-status-md'] : styles['db-status-sm'],
        styles[`db-status-${meta.tone}`]
      )}
    >
      <span className={styles['db-status-i']}>{STATUS_ICONS[status]}</span>
      <span className={styles['db-status-t']}>{meta.label}</span>
    </span>
  );
}

export function statusPickerItems(current: Status): TaskPickerItem[] {
  const items: TaskPickerItem[] = [];

  for (const stage of STAGE_ORDER) {
    items.push({
      id: `__stage_${stage}__`,
      kind: 'heading',
      label: STAGE_LABELS[stage],
    });

    for (const id of STATUS_OPTIONS) {
      if (STATUS_META[id].stage !== stage) continue;
      items.push({
        id,
        selected: id === current,
        searchText: STATUS_META[id].label,
        label: <StatusLabel status={id} size="md" />,
      });
    }
  }

  return items;
}

export function priorityPickerItems(current: Priority | null): TaskPickerItem[] {
  return PRIORITY_OPTIONS.map((id) => ({
    id,
    selected: id === current,
    searchText: PRIORITIES[id].label,
    label: (
      <Chip tone={PRIORITIES[id].tone}>
        <span className={styles['db-pri-flag']} aria-hidden>
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
      <span className={styles['db-pick-person']}>
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
      <span className={styles['db-pick-person']}>
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
        styles['db-status'],
        styles['db-status-sm'],
        styles['db-subtask-status-only'],
        styles[`db-status-${meta.tone}`],
      )}
    >
      <span className={styles['db-status-i']}>{STATUS_ICONS[status]}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority | null }) {
  if (!priority) return <span className={styles['db-empty']}>—</span>;
  const meta = PRIORITIES[priority];
  return (
    <Chip tone={meta.tone}>
      <span className={styles['db-pri-flag']} aria-hidden>
        {Icons.flag}
      </span>
      {meta.short}
    </Chip>
  );
}

export function AssigneeCell({ assigneeIds }: { assigneeIds: string[] }) {
  const members = assigneeIds.map((id) => teamById[id]).filter(Boolean);
  if (members.length === 0) return <span className={styles['db-empty']}>—</span>;

  const title = members.map((m) => m.name).join(', ');
  const visible = members.slice(0, 3);
  const extra = members.length - visible.length;

  return (
    <span className={styles['db-assignees']} title={title}>
      {visible.map((m) => (
        <span key={m.id} className={styles['db-assignees-av']}>
          <Avatar name={m.name} hue={m.hue} size="sm" />
        </span>
      ))}
      {extra > 0 ? <span className={styles['db-assignees-more']}>+{extra}</span> : null}
    </span>
  );
}

export function ProjectCell({ projectId }: { projectId: string | null }) {
  if (!projectId) return <span className={styles['db-empty']}>—</span>;
  const p = projectById[projectId];
  if (!p) return <span className={styles['db-empty']}>—</span>;
  return (
    <span className={styles['db-project']} title={p.name}>
      <Avatar name={p.name} hue={p.hue} size="sm" />
      <span className={styles['db-project-name']}>{p.name}</span>
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
