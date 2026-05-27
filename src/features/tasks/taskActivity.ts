import { PRIORITIES, STATUS_META } from './constants';
import { formatTaskDeadline } from './dateDisplay';
import { projectById, teamById } from './taskOptions';
import { TASK_TAGS, normalizeCustomTags, normalizeTaskTagIds } from './taskTags';
import type { Task, TaskActivityEntry, TaskCheckItem, TaskPatch, TaskTagId } from './types';
import { TASK_CREATOR_ASSIGNEE_ID } from './constants';

const MAX_ACTIVITY = 50;

function sameIdList(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((id, i) => id === sortedB[i]);
}

function nowIso(): string {
  return new Date().toISOString();
}

function formatTagsLine(tagIds: TaskTagId[], customTags: string[]): string {
  const labels = [
    ...normalizeTaskTagIds(tagIds).map((id) => TASK_TAGS[id].label),
    ...normalizeCustomTags(customTags),
  ];
  return labels.length ? labels.join(', ') : 'без тегів';
}

function formatAssignees(ids: string[]): string {
  if (!ids.length) return 'без відповідальних';
  return ids.map((id) => teamById[id]?.name ?? id).join(', ');
}

function describeCheckItemsChange(prev: TaskCheckItem[], next: TaskCheckItem[]): string | null {
  if (next.length > prev.length) {
    const added = next.filter((item) => !prev.some((p) => p.id === item.id));
    if (added.length === 1) return `додала в чекліст «${added[0]!.label}»`;
    return `додала ${added.length} пунктів у чекліст`;
  }
  if (next.length < prev.length) return 'видалила пункт чекліста';

  for (const item of next) {
    const before = prev.find((p) => p.id === item.id);
    if (!before) continue;
    if (before.done !== item.done) {
      return item.done ? `виконала «${item.label}» у чеклісті` : `зняла виконання «${item.label}»`;
    }
    if (before.label !== item.label) return 'перейменувала пункт чекліста';
  }

  return 'оновила чекліст';
}

function describePatch(prev: Task, patch: TaskPatch): string | null {
  const parts: string[] = [];

  if (patch.title !== undefined && patch.title !== prev.title) {
    parts.push('змінила назву задачі');
  }
  if (patch.description !== undefined && patch.description !== prev.description) {
    const wasEmpty = !prev.description.trim();
    const isEmpty = !patch.description.trim();
    if (isEmpty) parts.push('прибрала опис');
    else if (wasEmpty) parts.push('додала опис');
    else parts.push('оновила опис');
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
  if (patch.tagIds !== undefined || patch.customTags !== undefined) {
    const nextTagIds = patch.tagIds ?? prev.tagIds;
    const nextCustomTags = patch.customTags ?? prev.customTags;
    const prevLine = formatTagsLine(prev.tagIds, prev.customTags);
    const nextLine = formatTagsLine(nextTagIds, nextCustomTags);
    if (prevLine !== nextLine) parts.push(`змінила теги: ${nextLine}`);
  }
  if (patch.recurrenceRule !== undefined && patch.recurrenceRule !== prev.recurrenceRule) {
    parts.push(patch.recurrenceRule === null ? 'вимкнула повторення' : 'увімкнула повторення');
  }
  if (patch.deadline !== undefined && patch.deadline !== prev.deadline) {
    parts.push(
      patch.deadline === null
        ? 'прибрала дедлайн'
        : `встановила дедлайн ${formatTaskDeadline(patch.deadline)}`,
    );
  }
  if (patch.assigneeIds !== undefined && !sameIdList(patch.assigneeIds, prev.assigneeIds)) {
    parts.push(`змінила відповідальних: ${formatAssignees(patch.assigneeIds)}`);
  }
  if (patch.projectId !== undefined && patch.projectId !== prev.projectId) {
    if (patch.projectId === null) parts.push('прибрала проєкт');
    else {
      const name = projectById[patch.projectId]?.name ?? 'проєкт';
      parts.push(prev.projectId === null ? `додала проєкт «${name}»` : `змінила проєкт на «${name}»`);
    }
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
    const checkText = describeCheckItemsChange(prev.checkItems, patch.checkItems);
    if (checkText) parts.push(checkText);
  }
  if (patch.published !== undefined && patch.published !== prev.published) {
    parts.push(patch.published ? 'опублікувала задачу' : 'зняла публікацію задачі');
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

export function activityActorName(actorId: string | null): string {
  if (!actorId) return 'Система';
  return teamById[actorId]?.name ?? 'Користувач';
}
