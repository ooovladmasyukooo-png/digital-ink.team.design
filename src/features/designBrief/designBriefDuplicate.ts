import { getSubtaskAtPath } from './designBriefSubtask';
import type {
  DesignBrief,
  DesignBriefCheckItem,
  DesignBriefComment,
  DesignBriefCopyVariant,
  DesignBriefMaterial,
  DesignBriefReferenceLink,
  DesignBriefSubtask,
} from './types';

function createIdFactory(prefix: string) {
  let counter = 0;
  return () => `${prefix}${Date.now()}_${counter++}`;
}

function cloneCheckItems(items: DesignBriefCheckItem[], nextId: () => string): DesignBriefCheckItem[] {
  return items.map((item) => ({ ...item, id: nextId() }));
}

function cloneMaterials(items: DesignBriefMaterial[], nextId: () => string): DesignBriefMaterial[] {
  return items.map((item) => ({ ...item, id: nextId() }));
}

function cloneCopyVariants(items: DesignBriefCopyVariant[], nextId: () => string): DesignBriefCopyVariant[] {
  return items.map((item) => ({ ...item, id: nextId() }));
}

function cloneReferenceLinks(items: DesignBriefReferenceLink[], nextId: () => string): DesignBriefReferenceLink[] {
  return items.map((item) => ({ ...item, id: nextId() }));
}

function cloneSubtaskTree(subtask: DesignBriefSubtask, nextId: () => string): DesignBriefSubtask {
  return {
    ...subtask,
    id: nextId(),
    checkItems: cloneCheckItems(subtask.checkItems, nextId),
    subtasks: subtask.subtasks.map((child) => cloneSubtaskTree(child, nextId)),
  };
}

export function cloneDesignBrief(brief: DesignBrief, newId: string, now = new Date()): DesignBrief {
  const nextId = createIdFactory('s');

  return {
    ...brief,
    id: newId,
    createdAt: now.toISOString(),
    completedAt: null,
    status: brief.status === 'done' || brief.status === 'closed' ? 'new' : brief.status,
    activityLog: [],
    published: false,
    comments: brief.comments.map(
      (comment): DesignBriefComment => ({
        ...comment,
        id: nextId(),
        attachments: comment.attachments?.map((attachment) => ({ ...attachment, id: nextId() })),
      }),
    ),
    checkItems: cloneCheckItems(brief.checkItems, nextId),
    copyVariants: cloneCopyVariants(brief.copyVariants, nextId),
    referenceLinks: cloneReferenceLinks(brief.referenceLinks, nextId),
    referenceMaterials: cloneMaterials(brief.referenceMaterials, nextId),
    videoMaterials: cloneMaterials(brief.videoMaterials, nextId),
    subtasks: brief.subtasks.map((subtask) => cloneSubtaskTree(subtask, nextId)),
  };
}

export function cloneDesignBriefSubtask(subtask: DesignBriefSubtask): DesignBriefSubtask {
  const nextId = createIdFactory('s');
  return cloneSubtaskTree(subtask, nextId);
}

export function insertSubtaskAfterPath(
  subtasks: DesignBriefSubtask[],
  path: string[],
  clone: DesignBriefSubtask,
): DesignBriefSubtask[] {
  if (path.length === 0) return [...subtasks, clone];

  const [head, ...tail] = path;
  if (tail.length === 0) {
    const idx = subtasks.findIndex((subtask) => subtask.id === head);
    if (idx === -1) return subtasks;
    const next = [...subtasks];
    next.splice(idx + 1, 0, clone);
    return next;
  }

  return subtasks.map((subtask) =>
    subtask.id === head
      ? { ...subtask, subtasks: insertSubtaskAfterPath(subtask.subtasks, tail, clone) }
      : subtask,
  );
}

export function duplicateDesignBriefTarget(
  briefs: DesignBrief[],
  targetId: string,
  newRootId: string,
): DesignBrief[] {
  const slashIdx = targetId.indexOf('/');
  if (slashIdx === -1) {
    const idx = briefs.findIndex((brief) => brief.id === targetId);
    if (idx === -1) return briefs;
    const copy = cloneDesignBrief(briefs[idx], newRootId);
    const next = [...briefs];
    next.splice(idx + 1, 0, copy);
    return next;
  }

  const rootId = targetId.slice(0, slashIdx);
  const path = targetId.slice(slashIdx + 1).split('/');

  return briefs.map((brief) => {
    if (brief.id !== rootId) return brief;
    const source = getSubtaskAtPath(brief, path);
    if (!source) return brief;
    const copy = cloneDesignBriefSubtask(source);
    return {
      ...brief,
      subtasks: insertSubtaskAfterPath(brief.subtasks, path, copy),
    };
  });
}
