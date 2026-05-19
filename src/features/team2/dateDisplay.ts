/** DD.MM.YYYY ↔ YYYY-MM-DD for native `<input type="date" />`. */

const DISPLAY_RE = /^(\d{2})\.(\d{2})\.(\d{4})$/;

export function displayDateToIso(display: string): string {
  const m = display.trim().match(DISPLAY_RE);
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

export function isoToDisplayDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  return `${m[3]}.${m[2]}.${m[1]}`;
}
