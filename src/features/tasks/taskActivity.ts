import { PRIORITIES, STATUS_META } from './constants';
import { formatTaskDeadline } from './dateDisplay';
import type { Task, TaskActivityEntry, TaskPatch } from './types';
import { TASK_CREATOR_ASSIGNEE_ID } from './constants';

const MAX_ACTIVITY = 50;

function nowIso(): string {
  return new Date().toISOString();
}

function describePatch(prev: Task, patch: TaskPatch): string | null {
  const parts: string[] = [];

  if (patch.title !== undefined && patch.title !== prev.title) {
    parts.push('змінила назву задачі');
  }
  if (patch.description !== undefined && patch.description !== prev.description) {
    parts.push('оновила опис');
  }
  if (patch.status !== undefined && patch.status !== prev.status) {
    parts.push(`змінила статус на ${STATUS_META[patch.status].label}`);
  }
  if (patch.priority !== undefined && patch.priority !== prev.priority) {
    parts.push(
      patch.priority === null
        ? 'прибрала пріоритет'
        : `встановила пріоритет ${PRIORITIES[patch.priority].label}`,
    );
  }
  if (patch.deadline !== undefined && patch.deadline !== prev.deadline) {
    parts.push(
      patch.deadline === null
        ? 'прибрала дедлайн'
        : `встановила дедлайн ${formatTaskDeadline(patch.deadline)}`,
    );
  }
  if (patch.assigneeId !== undefined && patch.assigneeId !== prev.assigneeId) {
    parts.push('змінила відповідального');
  }
  if (patch.projectId !== undefined && patch.projectId !== prev.projectId) {
    parts.push(patch.projectId === null ? 'прибрала проєкт' : 'змінила проєкт');
  }
  if (patch.subtasks !== undefined) {
    const prevDone = prev.subtasks.filter((s) => s.status === 'done').length;
    const nextDone = patch.subtasks.filter((s) => s.status === 'done').length;
    if (nextDone > prevDone) parts.push('виконала підзадачу');
    else if (nextDone < prevDone) parts.push('повернула підзадачу');
    else if (patch.subtasks.length > prev.subtasks.length) parts.push('додала підзадачу');
    else if (patch.subtasks.length < prev.subtasks.length) parts.push('видалила підзадачу');
    else parts.push('оновила підзадачі');
  }
  if (patch.checkItems !== undefined) {
    parts.push('оновила чеклист');
  }

  if (parts.length === 0) return null;
  return parts.join(', ');
}

export function appendTaskActivity(
  next: Task,
  prev: Task,
  patch: TaskPatch,
  actorId: string = TASK_CREATOR_ASSIGNEE_ID,
): Task {
  const text = describePatch(prev, patch);
  if (!text) return next;

  const entry: TaskActivityEntry = {
    id: `a${Date.now()}`,
    at: nowIso(),
    actorId,
    text,
  };

  return {
    ...next,
    activityLog: [entry, ...prev.activityLog].slice(0, MAX_ACTIVITY),
  };
}

export function formatActivityAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - day.getTime()) / 86400000);

  const time = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return `сьогодні, ${time}`;
  if (diff === 1) return `вчора, ${time}`;
  return d.toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
