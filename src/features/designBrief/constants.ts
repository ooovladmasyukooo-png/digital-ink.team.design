import type { Priority, Status, DesignBrief, DesignBriefRecurrenceKind, DesignBriefFormat, DesignBriefSize, DesignBriefCopyVariant } from './types';
import type { DateGroupId } from '../tasks/types';
import { defaultDeadlineForGroup } from '../tasks/dateGroups';

/** Демо: автор ТЗ (Андрій Мельник). */
export const DESIGN_BRIEF_CREATOR_ID = 'andrii';

/** Демо: дизайнер за замовчуванням для нових ТЗ. */
export const DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID = 'nina';

export type Stage = 'todo' | 'inprogress' | 'complete';

export type StatusTone = 'slate' | 'gray' | 'blue' | 'purple' | 'amber' | 'green';

export const STAGE_LABELS: Record<Stage, string> = {
  todo: 'To do',
  inprogress: 'In progress',
  complete: 'Complete',
};

export const STATUS_META: Record<
  Status,
  { stage: Stage; label: string; rank: number; tone: StatusTone }
> = {
  new: { stage: 'todo', label: 'New', rank: 0, tone: 'gray' },
  ready: { stage: 'todo', label: 'Ready for design', rank: 1, tone: 'blue' },
  in_design: { stage: 'inprogress', label: 'In design', rank: 2, tone: 'purple' },
  approve: { stage: 'inprogress', label: 'Approve', rank: 3, tone: 'amber' },
  done: { stage: 'inprogress', label: 'Done', rank: 4, tone: 'green' },
  closed: { stage: 'complete', label: 'Closed', rank: 5, tone: 'slate' },
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
    status: 'new',
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
    referenceMaterials: [],
    videoMaterials: [],
    copyVariants: [createEmptyCopyVariant()],
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
    published: false,
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

export function createNewDesignBriefForGroup(
  groupId: DateGroupId,
  id: string,
  now = new Date(),
  assigneeId = DESIGN_BRIEF_DEFAULT_ASSIGNEE_ID,
  creatorId = DESIGN_BRIEF_CREATOR_ID,
): DesignBrief {
  return {
    ...createNewDesignBrief(id, assigneeId, creatorId),
    deadline: defaultDeadlineForGroup(groupId, now),
  };
}

export function createNewDesignBriefForMember(
  memberId: string,
  id: string,
  creatorId = DESIGN_BRIEF_CREATOR_ID,
): DesignBrief {
  return createNewDesignBrief(id, memberId, creatorId);
}
