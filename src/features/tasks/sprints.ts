import type { Priority, SprintPhaseId, TaskActivityEntry, TaskComment } from './types';

/** Демо-автор спринтів — збігається з TASK_CREATOR_ASSIGNEE_ID у constants.ts */
const DEFAULT_SPRINT_CREATOR_ID = 'andrii';

export interface Sprint {
  id: string;
  title: string;
  phase: SprintPhaseId;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  priority: Priority | null;
  assigneeIds: string[];
  /** Хто створив спринт */
  creatorId: string;
  /** ISO datetime */
  createdAt: string;
  description: string;
  comments: TaskComment[];
  activityLog: TaskActivityEntry[];
}

export const SPRINT_PHASE_ORDER: SprintPhaseId[] = ['active', 'queued', 'completed'];

/** Порядок у випадаючому списку статусу (В черзі — перший і за замовчуванням). */
export const SPRINT_PHASE_PICKER_ORDER: SprintPhaseId[] = ['queued', 'active', 'completed'];

export const DEFAULT_SPRINT_PHASE: SprintPhaseId = 'queued';

export const SPRINT_PHASE_LABELS: Record<SprintPhaseId, string> = {
  active: 'Активні',
  queued: 'В черзі',
  completed: 'Завершені',
};

/** Короткий підпис фази в рядку спринту. */
export const SPRINT_PHASE_BADGE_LABELS: Record<SprintPhaseId, string> = {
  active: 'Активний',
  queued: 'В черзі',
  completed: 'Завершено',
};

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function offsetIso(days: number, now = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/** Початкові спринти з відносними датами. */
const initialSprintSeeds = [
  {
    id: 'spr-active-1',
    title: 'Sprint 24 · Marketing',
    startDate: offsetIso(-15),
    endDate: offsetIso(5),
    priority: 'medium' as Priority,
    assigneeIds: ['daria'],
    creatorId: DEFAULT_SPRINT_CREATOR_ID,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    description: 'Фокус на кампаніях Q2 та A/B тестах лендінгів.',
    comments: [],
    activityLog: [],
  },
  {
    id: 'spr-active-2',
    title: 'Sprint 25 · Onboarding',
    startDate: offsetIso(-8),
    endDate: offsetIso(10),
    priority: 'high' as Priority,
    assigneeIds: ['andrii', 'daria'],
    creatorId: DEFAULT_SPRINT_CREATOR_ID,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    description: '',
    comments: [],
    activityLog: [],
  },
  {
    id: 'spr-queue-1',
    title: 'Sprint 26 · CRM',
    startDate: offsetIso(14),
    endDate: offsetIso(28),
    priority: null,
    assigneeIds: [],
    creatorId: DEFAULT_SPRINT_CREATOR_ID,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    description: '',
    comments: [],
    activityLog: [],
  },
  {
    id: 'spr-done-1',
    title: 'Sprint 23 · Reports',
    startDate: offsetIso(-45),
    endDate: offsetIso(-10),
    priority: 'low' as Priority,
    assigneeIds: ['andrii'],
    creatorId: DEFAULT_SPRINT_CREATOR_ID,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    description: '',
    comments: [],
    activityLog: [],
  },
] as const satisfies readonly Omit<Sprint, 'phase'>[];

export const initialSprints: Sprint[] = initialSprintSeeds.map((seed) => ({
  ...seed,
  phase: deriveSprintPhaseFromDates(seed),
}));

function parseDateOnly(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function deriveSprintPhaseFromDates(
  sprint: Pick<Sprint, 'startDate' | 'endDate'>,
  now = new Date(),
): SprintPhaseId {
  const today = startOfDay(now).getTime();
  const start = parseDateOnly(sprint.startDate)?.getTime();
  const end = parseDateOnly(sprint.endDate)?.getTime();
  if (start == null || end == null) return DEFAULT_SPRINT_PHASE;
  if (end < today) return 'completed';
  if (start > today) return 'queued';
  return 'active';
}

export function getSprintPhase(sprint: Pick<Sprint, 'phase'>): SprintPhaseId {
  return sprint.phase;
}

export function compareSprintsByStart(a: Sprint, b: Sprint): number {
  const aStart = parseDateOnly(a.startDate)?.getTime() ?? 0;
  const bStart = parseDateOnly(b.startDate)?.getTime() ?? 0;
  if (aStart !== bStart) return aStart - bStart;
  return a.id.localeCompare(b.id);
}

export function getSprintDurationDays(sprint: Pick<Sprint, 'startDate' | 'endDate'>): number | null {
  const start = parseDateOnly(sprint.startDate);
  const end = parseDateOnly(sprint.endDate);
  if (!start || !end) return null;
  const days = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Math.max(0, days);
}

export function formatSprintTermDate(iso: string | null): string {
  if (!iso) return '—';
  const datePart = iso.split('T')[0] ?? '';
  const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '—';
  return `${Number(m[3])}.${m[2]}`;
}

export function formatSprintDurationDaysShort(days: number): string {
  return `${Math.abs(Math.trunc(days))}д`;
}

export function formatSprintDurationDays(days: number): string {
  const n = Math.abs(Math.trunc(days));
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} днів`;
  if (mod10 === 1) return `${n} день`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} дні`;
  return `${n} днів`;
}
