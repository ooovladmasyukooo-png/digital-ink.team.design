import type {
  LegacyDesignBriefRecurrenceRule,
  DesignBrief,
  DesignBriefRecurrenceKind,
  DesignBriefRecurrenceRule,
  DesignBriefSubtask,
  Weekday,
} from './types';

function parseIso(iso: string): Date | null {
  const datePart = iso.split('T')[0];
  const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return startOfDay(x);
}

function mondayFirstWeekday(d: Date): Weekday {
  return ((d.getDay() + 6) % 7) as Weekday;
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86400000);
}

function dayOfMonthClamped(year: number, month: number, targetDay: number): number {
  const last = new Date(year, month + 1, 0).getDate();
  return Math.min(Math.max(1, targetDay), last);
}

function dateOnDayOfMonth(year: number, month: number, targetDay: number): Date {
  const day = dayOfMonthClamped(year, month, targetDay);
  return new Date(year, month, day);
}

export function weekdayFromIso(iso: string | null): Weekday {
  const d = iso ? parseIso(iso) : null;
  return d ? mondayFirstWeekday(d) : (mondayFirstWeekday(new Date()) as Weekday);
}

export function dayOfMonthFromIso(iso: string | null): number {
  const d = iso ? parseIso(iso) : null;
  return d ? d.getDate() : new Date().getDate();
}

export function defaultRecurrenceRule(kind: DesignBriefRecurrenceKind, deadlineIso: string | null): DesignBriefRecurrenceRule {
  const wd = weekdayFromIso(deadlineIso);
  const dom = dayOfMonthFromIso(deadlineIso);
  switch (kind) {
    case 'daily':
      return { kind: 'daily', weekdays: [wd] };
    case 'weekly':
      return { kind: 'weekly', weekday: wd };
    case 'monthly':
      return { kind: 'monthly', mode: 'dayOfMonth', day: dom };
  }
}

export function normalizeRecurrenceRule(
  rule: DesignBriefRecurrenceRule | LegacyDesignBriefRecurrenceRule | null | undefined,
  deadlineIso?: string | null,
): DesignBriefRecurrenceRule | null {
  if (!rule) return null;
  if (typeof rule === 'object' && 'kind' in rule) {
    return sanitizeRecurrenceRule(rule);
  }
  const legacy = rule as LegacyDesignBriefRecurrenceRule;
  switch (legacy) {
    case 'daily':
      return { kind: 'daily', weekdays: [0, 1, 2, 3, 4, 5, 6] };
    case 'weekly':
      return { kind: 'weekly', weekday: weekdayFromIso(deadlineIso ?? null) };
    case 'monthly':
    case 'yearly':
      return { kind: 'monthly', mode: 'dayOfMonth', day: dayOfMonthFromIso(deadlineIso ?? null) };
  }
  return null;
}

function sanitizeRecurrenceRule(rule: DesignBriefRecurrenceRule): DesignBriefRecurrenceRule {
  switch (rule.kind) {
    case 'daily': {
      const weekdays = [...new Set(rule.weekdays.filter((w) => w >= 0 && w <= 6))].sort() as Weekday[];
      return { kind: 'daily', weekdays: weekdays.length ? weekdays : [0] };
    }
    case 'weekly':
      return { kind: 'weekly', weekday: rule.weekday >= 0 && rule.weekday <= 6 ? rule.weekday : 0 };
    case 'monthly':
      if (rule.mode === 'everyNDays') {
        const intervalDays = Math.min(365, Math.max(1, Math.round(rule.intervalDays)));
        return { kind: 'monthly', mode: 'everyNDays', intervalDays };
      }
      return {
        kind: 'monthly',
        mode: 'dayOfMonth',
        day: Math.min(31, Math.max(1, Math.round(rule.day))),
      };
  }
}

function matchesRule(date: Date, rule: DesignBriefRecurrenceRule, seriesAnchor: Date): boolean {
  switch (rule.kind) {
    case 'daily':
      return rule.weekdays.includes(mondayFirstWeekday(date));
    case 'weekly':
      return mondayFirstWeekday(date) === rule.weekday;
    case 'monthly':
      if (rule.mode === 'everyNDays') {
        const diff = daysBetween(seriesAnchor, date);
        return diff >= 0 && diff % rule.intervalDays === 0;
      }
      return date.getDate() === dayOfMonthClamped(date.getFullYear(), date.getMonth(), rule.day);
  }
}

/** Наступна дата серії після `from` (inclusive = включно з from). */
export function nextOccurrenceAfter(
  rule: DesignBriefRecurrenceRule,
  from: Date,
  inclusive = false,
  seriesAnchor?: Date,
): Date {
  const anchor = startOfDay(seriesAnchor ?? from);
  let probe = inclusive ? startOfDay(from) : addDays(from, 1);

  for (let i = 0; i < 400; i++) {
    if (matchesRule(probe, rule, anchor)) return probe;
    probe = addDays(probe, 1);
  }

  return addDays(from, 1);
}

export function nextDeadlineAfter(
  deadline: string | null,
  rule: DesignBriefRecurrenceRule,
  now = new Date(),
): string {
  const anchor = (deadline && parseIso(deadline)) || startOfDay(now);
  const next = nextOccurrenceAfter(rule, anchor, false, anchor);
  return toIso(next);
}

/** Дні місяця (1–31) — лише майбутні повторення за обраним правилом (після дедлайну-якоря). */
export function recurrenceDaysInMonth(
  year: number,
  month: number,
  rule: DesignBriefRecurrenceRule,
  anchorIso: string | null,
  fromDate = startOfDay(new Date()),
): Set<number> {
  const today = startOfDay(fromDate);
  const anchor = anchorIso ? parseIso(anchorIso) : null;
  const seriesAnchor = anchor ?? today;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days = new Set<number>();

  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    if (d.getTime() <= today.getTime()) continue;
    if (anchor && d.getTime() <= anchor.getTime()) continue;
    if (matchesRule(d, rule, seriesAnchor)) {
      days.add(day);
    }
  }

  return days;
}

function resetSubtasksForRecurrence(subtasks: DesignBriefSubtask[]): DesignBriefSubtask[] {
  return subtasks.map((s) => ({
    ...s,
    status: 'new',
    checkItems: s.checkItems.map((c) => ({ ...c, done: false })),
    subtasks: resetSubtasksForRecurrence(s.subtasks),
  }));
}

/** Нова копія задачі після виконання повторюваної. */
export function spawnRecurringDesignBrief(brief: DesignBrief, newId: string, now = new Date()): DesignBrief {
  if (!brief.recurrenceRule) return brief;
  const rule = sanitizeRecurrenceRule(brief.recurrenceRule);

  return {
    ...brief,
    id: newId,
    status: 'new',
    deadline: nextDeadlineAfter(brief.deadline, rule, now),
    completedAt: null,
    createdAt: now.toISOString(),
    recurrenceRule: rule,
    comments: [],
    activityLog: [],
    published: false,
    checkItems: brief.checkItems.map((c) => ({ ...c, done: false })),
    subtasks: resetSubtasksForRecurrence(brief.subtasks),
  };
}

export function shouldSpawnRecurring(prev: DesignBrief, patch: { status?: DesignBrief['status'] }): boolean {
  return patch.status === 'closed' && prev.status !== 'closed' && prev.recurrenceRule !== null;
}
