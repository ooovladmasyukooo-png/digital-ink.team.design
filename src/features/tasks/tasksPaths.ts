import type { TasksViewTabId } from './types';
import { formatTaskRef } from './taskRef';

/** Ключі в URL списку: /tasks?day, /tasks?project, … */
export type TasksViewQuery = 'day' | 'project' | 'my' | 'team' | 'done';

export const TASKS_VIEW_QUERIES: TasksViewQuery[] = ['day', 'project', 'my', 'team', 'done'];

export const QUERY_TO_TAB_ID: Record<TasksViewQuery, TasksViewTabId> = {
  day: 'by-date',
  project: 'by-area',
  my: 'personal',
  team: 'delegated',
  done: 'archive',
};

export const TAB_ID_TO_QUERY: Record<TasksViewTabId, TasksViewQuery> = {
  'by-date': 'day',
  'by-area': 'project',
  personal: 'my',
  delegated: 'team',
  archive: 'done',
};

const TAB_DOC_TITLE: Record<TasksViewTabId, string> = {
  'by-date': 'За датами',
  'by-area': 'По проектах',
  personal: 'Особисті',
  delegated: 'Делеговані',
  archive: 'Архів',
};

export function tasksDocumentTitle(tabId: TasksViewTabId): string {
  return `${TAB_DOC_TITLE[tabId]} · Задачі · Aurora CRM`;
}

export type ParsedTasksSearch = {
  view: TasksViewQuery;
  taskId: string | null;
  /** Повна сторінка: /tasks?id=… без ключа вкладки */
  full: boolean;
};

function decodeId(value: string): string {
  try {
    return decodeURIComponent(value.trim());
  } catch {
    return value.trim();
  }
}

export function parseTasksSearch(search: string): ParsedTasksSearch {
  if (!search || search === '?') {
    return { view: 'day', taskId: null, full: false };
  }

  const raw = search.startsWith('?') ? search.slice(1) : search;
  let view: TasksViewQuery = 'day';
  let taskId: string | null = null;
  let hasViewKey = false;
  let full = false;

  for (const part of raw.split('&').filter(Boolean)) {
    const eq = part.indexOf('=');
    const key = (eq === -1 ? part : part.slice(0, eq)).trim().toLowerCase();
    const value = eq === -1 ? '' : part.slice(eq + 1);

    if ((TASKS_VIEW_QUERIES as string[]).includes(key)) {
      view = key as TasksViewQuery;
      hasViewKey = true;
      continue;
    }
    if (key === 'full') {
      full = true;
      continue;
    }
    if ((key === 'id' || key === 'task') && value.trim()) {
      taskId = decodeId(value);
    }
  }

  if (taskId && !hasViewKey) {
    full = true;
  }

  return { view, taskId, full };
}

export function tabIdFromSearch(search: string): TasksViewTabId {
  return QUERY_TO_TAB_ID[parseTasksSearch(search).view];
}

export type BuildTasksSearchOpts = {
  task?: string | null;
  full?: boolean;
};

/** Query для задачі: ?id=t1 */
export function buildTaskSearch(taskId: string): string {
  return `?id=${encodeURIComponent(taskId)}`;
}

/** Повний шлях (поділитися, href): /tasks?id=t1 */
export function buildTaskLink(taskId: string): string {
  return `/tasks${buildTaskSearch(taskId)}`;
}

/** Список задач: /tasks?day або drawer /tasks?day&id=t1 */
export function buildTasksSearch(view: TasksViewQuery, opts?: BuildTasksSearchOpts): string {
  if (opts?.full && opts.task) {
    return buildTaskSearch(opts.task);
  }
  let q = `?${view}`;
  if (opts?.task) {
    q += `&id=${encodeURIComponent(opts.task)}`;
  }
  return q;
}

export function pathForTasksView(view: TasksViewQuery, opts?: BuildTasksSearchOpts): string {
  return `/tasks${buildTasksSearch(view, opts)}`;
}

export function taskDocumentTitle(taskTitle: string, taskId: string): string {
  return `${taskTitle} · ${formatTaskRef(taskId)} · Задачі · Aurora CRM`;
}
