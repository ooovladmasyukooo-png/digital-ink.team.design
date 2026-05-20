/** Відображуваний номер задачі для крихт: t1 → #001, t12 → #012 */
export function formatTaskRef(taskId: string): string {
  const m = taskId.match(/^t(\d+)$/i);
  if (m) return `#${m[1].padStart(3, '0')}`;
  return `#${taskId}`;
}
