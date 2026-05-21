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
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

/** Момент дедлайну в мс: дата без часу → кінець календарного дня; ISO datetime → як є. */
export function deadlineToMs(iso: string | null): number | null {
  if (!iso) return null;
  if (iso.includes('T')) {
    const t = new Date(iso).getTime();
    return Number.isNaN(t) ? null : t;
  }
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

export function formatTaskDeadline(iso: string | null): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';

  const now = new Date();
  if (y === now.getFullYear()) {
    return UK_SHORT.format(dt);
  }
  return UK_LONG.format(dt);
}

export function isoToDisplayDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  return `${m[3]}.${m[2]}.${m[1]}`;
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
