import type { ReactNode } from 'react';
import { Icons } from '../../shared/components/Icon';
import type { TaskTagId } from './types';

export type TaskTagTone = 'orange' | 'cyan' | 'cold';

export const TASK_TAGS: Record<
  TaskTagId,
  { label: string; tone: TaskTagTone; icon: ReactNode }
> = {
  quick: { label: 'Quick', tone: 'orange', icon: Icons.bolt },
  client: { label: 'Client', tone: 'cyan', icon: Icons.client },
  slow: { label: 'Slow', tone: 'cold', icon: Icons.snowflake },
};

/** Порядок відображення та вибору в picker. */
export const TASK_TAG_OPTIONS: TaskTagId[] = ['quick', 'client', 'slow'];

export function normalizeTaskTagIds(tagIds?: TaskTagId[] | null): TaskTagId[] {
  if (!tagIds?.length) return [];
  const allowed = new Set(TASK_TAG_OPTIONS);
  return TASK_TAG_OPTIONS.filter((id) => tagIds.includes(id) && allowed.has(id));
}

export function sortTaskTagIds(tagIds: TaskTagId[]): TaskTagId[] {
  const set = new Set(tagIds);
  return TASK_TAG_OPTIONS.filter((id) => set.has(id));
}

export function toggleTaskTagIds(current: TaskTagId[], id: string): TaskTagId[] {
  if (id === '__none__') return [];
  if (!TASK_TAG_OPTIONS.includes(id as TaskTagId)) return current;
  const tagId = id as TaskTagId;
  if (current.includes(tagId)) return current.filter((x) => x !== tagId);
  return sortTaskTagIds([...current, tagId]);
}

export function normalizeCustomTags(tags?: string[] | null): string[] {
  if (!tags?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const t = raw.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export function addCustomTag(current: string[], label: string): string[] {
  const t = label.trim();
  if (!t) return normalizeCustomTags(current);
  const norm = normalizeCustomTags(current);
  if (norm.some((x) => x.toLowerCase() === t.toLowerCase())) return norm;
  return [...norm, t];
}

export function removeCustomTag(current: string[], label: string): string[] {
  const key = label.trim().toLowerCase();
  return normalizeCustomTags(current).filter((x) => x.toLowerCase() !== key);
}

export function taskHasTags(tagIds?: TaskTagId[] | null, customTags?: string[] | null): boolean {
  return normalizeTaskTagIds(tagIds).length > 0 || normalizeCustomTags(customTags).length > 0;
}

export interface TaskTagsValue {
  tagIds: TaskTagId[];
  customTags: string[];
}

export function emptyTaskTags(): TaskTagsValue {
  return { tagIds: [], customTags: [] };
}
