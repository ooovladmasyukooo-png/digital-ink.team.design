import type { Priority, Status, DesignBrief, DesignBriefRecurrenceKind, DesignBriefFormat, DesignBriefSize, DesignBriefCopyVariant } from './types';

/** Демо: автор ТЗ (Андрій Мельник). */
export const DESIGN_BRIEF_CREATOR_ID = 'andrii';

/** Демо: дизайнер за замовчуванням для нових ТЗ. */
export const DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID = 'nina';

export type Stage = 'todo' | 'inprogress' | 'complete';

export type StatusTone = 'slate' | 'gray' | 'blue' | 'purple' | 'green';

export const STATUS_META: Record<
  Status,
  { stage: Stage; label: string; rank: number; tone: StatusTone }
> = {
  inbox: { stage: 'todo', label: 'Inbox', rank: 0, tone: 'slate' },
  new: { stage: 'todo', label: 'New', rank: 1, tone: 'gray' },
  doing: { stage: 'inprogress', label: 'Doing', rank: 2, tone: 'blue' },
  control: { stage: 'inprogress', label: 'Control', rank: 3, tone: 'purple' },
  done: { stage: 'complete', label: 'Done', rank: 4, tone: 'green' },
  archive: { stage: 'complete', label: 'Archive', rank: 5, tone: 'slate' },
};

export const PRIORITIES: Record<Priority, { label: string; short: string; rank: number; tone: 'red' | 'blue' | 'gray' }> = {
  high: { label: 'High', short: 'High', rank: 0, tone: 'red' },
  medium: { label: 'Medium', short: 'Med.', rank: 1, tone: 'blue' },
  low: { label: 'Low', short: 'Low', rank: 2, tone: 'gray' },
};

export const STATUS_OPTIONS = (Object.keys(STATUS_META) as Status[]).sort(
  (a, b) => STATUS_META[a].rank - STATUS_META[b].rank,
);

export const PRIORITY_OPTIONS = (Object.keys(PRIORITIES) as Priority[]).sort(
  (a, b) => PRIORITIES[a].rank - PRIORITIES[b].rank,
);

export const RECURRENCE_KIND_OPTIONS: { kind: DesignBriefRecurrenceKind; label: string }[] = [
  { kind: 'daily', label: 'По днях тижня' },
  { kind: 'weekly', label: 'Щотижня' },
  { kind: 'monthly', label: 'Щомісяця' },
];

export const RECURRENCE_WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'] as const;

export const DESIGN_BRIEF_FORMAT_OPTIONS: { id: DesignBriefFormat; label: string }[] = [
  { id: 'static', label: 'Static' },
  { id: 'video', label: 'Video' },
];

export const DESIGN_BRIEF_SIZE_OPTIONS: { id: DesignBriefSize; label: string }[] = [
  { id: '1:1', label: '1:1' },
  { id: '4:5', label: '4:5' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
];

export function defaultCopyVariantLabel(index: number): string {
  return `Варіант ${index + 1}`;
}

export function createEmptyCopyVariant(): DesignBriefCopyVariant {
  return { id: `copy${Date.now()}`, body: '' };
}

export function createNewDesignBrief(
  id: string,
  assigneeId = DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID,
  creatorId = DESIGN_BRIEF_CREATOR_ID,
  projectId: string | null = null,
): DesignBrief {
  return {
    id,
    title: 'Нове ТЗ',
    status: 'inbox',
    priority: null,
    deadline: null,
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: [assigneeId],
    creatorId,
    createdAt: new Date().toISOString(),
    projectId,
    format: null,
    sizes: [],
    referenceLinks: [],
    copyVariants: [createEmptyCopyVariant()],
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  };
}

export function createNewDesignBriefForStatus(
  status: Status,
  id: string,
  creatorId = DESIGN_BRIEF_CREATOR_ID,
  assigneeId = DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID,
): DesignBrief {
  return {
    ...createNewDesignBrief(id, assigneeId, creatorId),
    status,
  };
}
