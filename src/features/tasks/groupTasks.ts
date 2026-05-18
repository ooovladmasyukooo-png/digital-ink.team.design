import type { Task, TaskPriority, TasksViewTabId } from './types';

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export function sortTasksByPriorityThenDeadline(a: Task, b: Task): number {
  const pr = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
  if (pr !== 0) return pr;
  if (!a.deadline && !b.deadline) return 0;
  if (!a.deadline) return 1;
  if (!b.deadline) return -1;
  return a.deadline.localeCompare(b.deadline);
}

export type DateGroupId = 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'later' | 'no_date';

export const DATE_GROUP_ORDER: DateGroupId[] = ['overdue', 'today', 'tomorrow', 'this_week', 'later', 'no_date'];

export const DATE_GROUP_LABELS: Record<DateGroupId, string> = {
  overdue: 'Прострочені',
  today: 'Сьогоднішні',
  tomorrow: 'Завтра',
  this_week: 'Цього тижня',
  later: 'Пізніше',
  no_date: 'Без дати',
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return startOfDay(x);
}

export function parseYmd(s: string): Date {
  const [y, m, day] = s.split('-').map(Number);
  return startOfDay(new Date(y, m - 1, day));
}

function daysEqual(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

/** Понеділок поточного тижня, 00:00 */
function startOfWeekMonday(d: Date): Date {
  const x = startOfDay(d);
  const dow = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dow);
  return x;
}

/** Неділя цього календарного тижня (понеділок-неділя), 00:00 */
function endOfWeekSundayDate(d: Date): Date {
  const s = startOfWeekMonday(d);
  return startOfDay(addDays(s, 6));
}

export function getDateGroupId(task: Task, now: Date = new Date()): DateGroupId {
  if (!task.deadline) return 'no_date';
  const deadline = parseYmd(task.deadline);
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);

  if (deadline < today) return 'overdue';
  if (daysEqual(deadline, today)) return 'today';
  if (daysEqual(deadline, tomorrow)) return 'tomorrow';

  const weekEnd = endOfWeekSundayDate(now);
  if (deadline > tomorrow && deadline.getTime() <= weekEnd.getTime()) return 'this_week';
  return 'later';
}

function formatDateMeta(d: Date): string {
  return d.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getDateGroupMeta(id: DateGroupId, now: Date): string | undefined {
  const today = startOfDay(now);
  if (id === 'today') return formatDateMeta(today);
  if (id === 'tomorrow') return formatDateMeta(addDays(today, 1));
  if (id === 'this_week') {
    const weekEnd = endOfWeekSundayDate(now);
    return `до ${formatDateMeta(weekEnd)}`;
  }
  return undefined;
}

export function groupTasksByDate(tasks: Task[], now?: Date): { id: DateGroupId; label: string; meta?: string; tasks: Task[] }[] {
  const n = now ?? new Date();
  const buckets: Record<DateGroupId, Task[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    this_week: [],
    later: [],
    no_date: [],
  };
  tasks.forEach((task) => {
    buckets[getDateGroupId(task, n)].push(task);
  });
  return DATE_GROUP_ORDER.filter((id) => buckets[id].length > 0).map((id) => ({
    id,
    label: DATE_GROUP_LABELS[id],
    meta: getDateGroupMeta(id, n),
    tasks: buckets[id].slice().sort(sortTasksByPriorityThenDeadline),
  }));
}

export function groupTasksByProject(tasks: Task[]): { id: string; label: string; tasks: Task[] }[] {
  const map = new Map<string, Task[]>();
  tasks.forEach((task) => {
    const list = map.get(task.projectName) ?? [];
    list.push(task);
    map.set(task.projectName, list);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'uk'))
    .map(([label, list]) => ({
      id: label,
      label,
      tasks: list.slice().sort(sortTasksByPriorityThenDeadline),
    }));
}

export const CURRENT_USER_ID = 'andrii';

export function filterTasksForTab(tasks: Task[], tab: TasksViewTabId): Task[] {
  switch (tab) {
    case 'archive':
      return tasks.filter((t) => t.status === 'done');
    case 'personal':
      return tasks.filter((t) => t.assigneeId === CURRENT_USER_ID && t.status !== 'done');
    case 'delegated':
      return tasks.filter(
        (t) => t.createdById === CURRENT_USER_ID && t.assigneeId !== CURRENT_USER_ID && t.status !== 'done',
      );
    case 'by-date':
    case 'by-area':
    default:
      return tasks.filter((t) => t.status !== 'done');
  }
}

export function formatDeadlineShort(ymd: string | null): string {
  if (!ymd) return '—';
  const d = parseYmd(ymd);
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
}

export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (!task.deadline || task.status === 'done') return false;
  return parseYmd(task.deadline).getTime() < startOfDay(now).getTime();
}

/** Дедлайн у календарний «сьогодні» (локально). */
export function isDeadlineToday(task: Task, now: Date = new Date()): boolean {
  if (!task.deadline || task.status === 'done') return false;
  const t = startOfDay(now);
  return parseYmd(task.deadline).getTime() === t.getTime();
}

export function sortArchiveTasks(tasks: Task[]): Task[] {
  return tasks.slice().sort((a, b) => {
    if (!a.deadline && !b.deadline) return sortTasksByPriorityThenDeadline(a, b);
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    const c = b.deadline.localeCompare(a.deadline);
    return c !== 0 ? c : sortTasksByPriorityThenDeadline(a, b);
  });
}
