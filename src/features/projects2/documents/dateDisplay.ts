/** Дата оновлення документа: «27.5.26 о 12:44». */
export function formatDocumentDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} о ${hours}:${minutes}`;
}

export function isDocumentImageIcon(icon: string | null | undefined): icon is string {
  return Boolean(icon?.startsWith('data:image/'));
}
