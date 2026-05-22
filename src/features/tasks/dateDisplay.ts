const UK_SHORT = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
});

const UK_LONG = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function parseCompletedDateTime(iso: string): Date | null {
  if (iso.includes('T')) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

/** Дата й час створення / виконання (напр. «20 трав., 14:30»). */
export function formatTaskDateTime(iso: string | null): string {
  if (!iso) return '—';
  const dt = parseCompletedDateTime(iso);
  if (!dt) return '—';

  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  const dateLabel = formatTaskDeadline(`${y}-${m}-${day}`);
  const time = dt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  return `${dateLabel}, ${time}`;
}

/** @deprecated Use formatTaskDateTime */
export const formatTaskCompletedAt = formatTaskDateTime;

function parseDateOnlyLocal(iso: string): Date | null {
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

export interface ParsedDeadline {
  date: Date | null;
  hasTime: boolean;
  hours: number;
  minutes: number;
}

export function parseTimeInputValue(value: string): { hours: number; minutes: number } | null {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

export function formatTimeInputValue(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function parseDeadlineValue(iso: string | null): ParsedDeadline {
  if (!iso) return { date: null, hasTime: false, hours: 9, minutes: 0 };

  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return { date: null, hasTime: false, hours: 9, minutes: 0 };

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    return { date: null, hasTime: false, hours: 9, minutes: 0 };
  }

  const hasTime = m[4] !== undefined;
  return {
    date: dt,
    hasTime,
    hours: hasTime ? Number(m[4]) : 9,
    minutes: hasTime ? Number(m[5]) : 0,
  };
}

export function buildDeadlineIso(
  year: number,
  month: number,
  day: number,
  time?: { hours: number; minutes: number } | null,
): string {
  const y = String(year);
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  if (!time) return `${y}-${m}-${d}`;
  const hh = String(time.hours).padStart(2, '0');
  const mm = String(time.minutes).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function parseDeadlineDateTimeLocal(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const min = Number(m[5]);
  const dt = new Date(y, mo - 1, d, h, min);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo - 1 ||
    dt.getDate() !== d ||
    dt.getHours() !== h ||
    dt.getMinutes() !== min
  ) {
    return null;
  }
  return dt;
}

/** Момент дедлайну в мс: дата без часу → кінець календарного дня; ISO datetime → як є. */
export function deadlineToMs(iso: string | null): number | null {
  if (!iso) return null;
  const withTime = parseDeadlineDateTimeLocal(iso);
  if (withTime) return withTime.getTime();
  const day = parseDateOnlyLocal(iso);
  if (!day) return null;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999).getTime();
}

/** Момент виконання в мс (ISO datetime або дата). */
export function completedAtToMs(iso: string | null): number | null {
  if (!iso) return null;
  if (iso.includes('T')) {
    const t = new Date(iso).getTime();
    return Number.isNaN(t) ? null : t;
  }
  const day = parseDateOnlyLocal(iso);
  if (!day) return null;
  return day.getTime();
}

/** Виконано пізніше дедлайну (наступний день, година тощо). */
export function isCompletedAfterDeadline(
  deadline: string | null,
  completedAt: string | null,
): boolean {
  const deadlineMs = deadlineToMs(deadline);
  const completedMs = completedAtToMs(completedAt);
  if (deadlineMs === null || completedMs === null) return false;
  return completedMs > deadlineMs;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export type TaskDeadlineRelativeKind = 'today' | 'tomorrow' | 'other';

export function getTaskDeadlineRelativeKind(
  iso: string | null,
  now = new Date(),
): TaskDeadlineRelativeKind | null {
  if (!iso) return null;
  const parsed = parseDeadlineValue(iso);
  if (!parsed.date) return null;

  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadlineDay = startOfDay(parsed.date);

  if (deadlineDay.getTime() === today.getTime()) return 'today';
  if (deadlineDay.getTime() === tomorrow.getTime()) return 'tomorrow';
  return 'other';
}

function formatTaskDeadlineDateLabel(date: Date, now = new Date()): string {
  const kind = getTaskDeadlineRelativeKind(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    now,
  );

  if (kind === 'today') return 'Сьогодні';
  if (kind === 'tomorrow') return 'Завтра';

  const y = date.getFullYear();
  return y === now.getFullYear() ? UK_SHORT.format(date) : UK_LONG.format(date);
}

export function formatTaskDeadline(iso: string | null, now = new Date()): string {
  if (!iso) return '';
  const parsed = parseDeadlineValue(iso);
  if (!parsed.date) return '';

  const dateLabel = formatTaskDeadlineDateLabel(parsed.date, now);

  if (!parsed.hasTime) return dateLabel;

  const hh = String(parsed.hours).padStart(2, '0');
  const mm = String(parsed.minutes).padStart(2, '0');
  return `${dateLabel}, ${hh}:${mm}`;
}

export function isoToDisplayDate(iso: string): string {
  return formatTaskDeadline(iso);
}

export function displayDateToIso(display: string): string {
  const m = display.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return '';
  const [, dd, mm, yyyy] = m;
  const y = Number(yyyy);
  const mo = Number(mm);
  const d = Number(dd);
  const parsed = new Date(y, mo - 1, d);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== y ||
    parsed.getMonth() !== mo - 1 ||
    parsed.getDate() !== d
  ) {
    return '';
  }
  return `${yyyy}-${mm}-${dd}`;
}
