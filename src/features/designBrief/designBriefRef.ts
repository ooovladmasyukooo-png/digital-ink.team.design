/** Відображуваний номер ТЗ: db1 → #001 */
export function formatDesignBriefRef(briefId: string): string {
  const m = briefId.match(/^db(\d+)$/i);
  if (m) return `#${m[1].padStart(3, '0')}`;
  return `#${briefId}`;
}
