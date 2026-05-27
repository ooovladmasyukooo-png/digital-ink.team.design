export type Status = 'new' | 'ready' | 'in_design' | 'approve' | 'done' | 'closed';
export type Priority = 'high' | 'medium' | 'low';

/** 0 = понеділок … 6 = неділя (як у календарі дедлайну). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DesignBriefRecurrenceKind = 'daily' | 'weekly' | 'monthly';

export type DesignBriefRecurrenceRule =
  | { kind: 'daily'; weekdays: Weekday[] }
  | { kind: 'weekly'; weekday: Weekday }
  | { kind: 'monthly'; mode: 'dayOfMonth'; day: number }
  | { kind: 'monthly'; mode: 'everyNDays'; intervalDays: number };

export type LegacyDesignBriefRecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type DesignBriefFormat = 'static' | 'video';
export type DesignBriefSize = '1:1' | '4:5' | '16:9' | '9:16';

export type DesignBriefViewTabId = 'by-date' | 'by-status' | 'by-people' | 'archive';

export interface DesignBriefReferenceLink {
  id: string;
  url: string;
  label?: string;
}

export interface DesignBriefCopyVariant {
  id: string;
  body: string;
}

export interface DesignBriefMaterial {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  kind: 'image' | 'video';
}

export interface DesignBriefCheckItem {
  id: string;
  label: string;
  done: boolean;
}

export interface DesignBriefSubtask {
  id: string;
  title: string;
  status: Status;
  priority: Priority | null;
  assigneeIds: string[];
  projectId: string | null;
  deadline: string | null;
  completedAt: string | null;
  description: string;
  checkItems: DesignBriefCheckItem[];
  subtasks: DesignBriefSubtask[];
}

export interface DesignBriefActivityEntry {
  id: string;
  at: string;
  actorId: string | null;
  text: string;
}

export interface DesignBriefCommentAttachment {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
}

export interface DesignBriefComment {
  id: string;
  at: string;
  authorId: string;
  body: string;
  mentionIds?: string[];
  attachments?: DesignBriefCommentAttachment[];
}

export interface DesignBrief {
  id: string;
  title: string;
  status: Status;
  priority: Priority | null;
  deadline: string | null;
  completedAt: string | null;
  recurrenceRule: DesignBriefRecurrenceRule | null;
  assigneeIds: string[];
  creatorId: string;
  createdAt: string;
  projectId: string | null;
  format: DesignBriefFormat | null;
  sizes: DesignBriefSize[];
  referenceLinks: DesignBriefReferenceLink[];
  referenceMaterials: DesignBriefMaterial[];
  videoMaterials: DesignBriefMaterial[];
  copyVariants: DesignBriefCopyVariant[];
  description: string;
  checkItems: DesignBriefCheckItem[];
  subtasks: DesignBriefSubtask[];
  comments: DesignBriefComment[];
  activityLog: DesignBriefActivityEntry[];
  /** Публічне посилання без входу в CRM */
  published: boolean;
}

export type DesignBriefPatch = Partial<
  Pick<
    DesignBrief,
    | 'title'
    | 'status'
    | 'priority'
    | 'deadline'
    | 'completedAt'
    | 'recurrenceRule'
    | 'assigneeIds'
    | 'creatorId'
    | 'createdAt'
    | 'projectId'
    | 'format'
    | 'sizes'
    | 'referenceLinks'
    | 'referenceMaterials'
    | 'videoMaterials'
    | 'copyVariants'
    | 'description'
    | 'checkItems'
    | 'subtasks'
    | 'comments'
    | 'activityLog'
    | 'published'
  >
>;
