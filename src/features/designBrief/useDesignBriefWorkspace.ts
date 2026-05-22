import { useCallback, useState, useSyncExternalStore } from 'react';
import {
  createNewDesignBrief,
  createNewDesignBriefForGroup,
  createNewDesignBriefForMember,
  createNewDesignBriefForStatus,
  DESIGN_BRIEF_CREATOR_ID,
} from './constants';
import {
  allocateDesignBriefId,
  getDesignBriefs,
  setDesignBriefs,
  subscribeDesignBriefs,
} from './designBriefStore';
import { appendDesignBriefActivity } from './designBriefActivity';
import {
  mergeDesignBriefPatchWithCompletion,
  mergeSubtaskPatchWithCompletion,
} from './designBriefCompletion';
import { shouldSpawnRecurring, spawnRecurringDesignBrief } from './recurrence';
import {
  appendSubtaskAtPath,
  applyPatchAtSubtaskPath,
  designBriefFromSubtask,
  getParentTaskLink,
  getSubtaskAtPath,
  removeSubtaskAtPath,
} from './designBriefSubtask';
import { duplicateDesignBriefTarget } from './designBriefDuplicate';
import { collapseTreeBranch, expandTreeBranch, treeRowKey } from './designBriefTree';
import type { DateGroupId } from '../tasks/types';
import type { DesignBriefPatch, DesignBriefSubtask, Status } from './types';

export function useDesignBriefWorkspace(viewerId = DESIGN_BRIEF_CREATOR_ID) {
  const briefs = useSyncExternalStore(subscribeDesignBriefs, getDesignBriefs, getDesignBriefs);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [subtaskPath, setSubtaskPath] = useState<string[]>([]);
  const [expandedTreeKeys, setExpandedTreeKeys] = useState<Set<string>>(() => new Set());

  const closeDetail = useCallback(() => {
    setSelectedBriefId(null);
    setSubtaskPath([]);
  }, []);

  const toggleTreeExpand = useCallback((rootId: string, path: string[]) => {
    const key = treeRowKey(rootId, path);
    setExpandedTreeKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) collapseTreeBranch(next, rootId, path);
      else expandTreeBranch(next, rootId, path);
      return next;
    });
  }, []);

  const openBrief = useCallback((briefId: string, path: string[] = []) => {
    setSelectedBriefId(briefId);
    setSubtaskPath(path);
  }, []);

  const updateSubtaskAtPath = useCallback((rootId: string, path: string[], patch: DesignBriefPatch) => {
    setDesignBriefs((prev) =>
      prev.map((b) => {
        if (b.id !== rootId) return b;
        const sub = getSubtaskAtPath(b, path);
        if (!sub) return b;
        const merged = mergeSubtaskPatchWithCompletion(sub, patch);
        const subtasks = applyPatchAtSubtaskPath(b.subtasks, path, merged);
        return appendDesignBriefActivity({ ...b, subtasks }, b, { subtasks });
      }),
    );
  }, []);

  const addSubtaskAtPath = useCallback(
    (rootId: string, parentPath: string[], subtask: DesignBriefSubtask) => {
      setExpandedTreeKeys((prev) => {
        const next = new Set(prev);
        expandTreeBranch(next, rootId, parentPath);
        return next;
      });
      setDesignBriefs((prev) =>
        prev.map((b) => {
          if (b.id !== rootId) return b;
          const subtasks = appendSubtaskAtPath(b.subtasks, parentPath, subtask);
          return appendDesignBriefActivity({ ...b, subtasks }, b, { subtasks });
        }),
      );
    },
    [],
  );

  const updateBrief = useCallback((id: string, patch: DesignBriefPatch) => {
    setDesignBriefs((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const brief = prev[idx];
      const merged = mergeDesignBriefPatchWithCompletion(brief, patch);
      const next = appendDesignBriefActivity({ ...brief, ...merged }, brief, merged);
      if (!shouldSpawnRecurring(brief, merged)) {
        return prev.map((item, i) => (i === idx ? next : item));
      }
      const clone = spawnRecurringDesignBrief(next, allocateDesignBriefId());
      return prev.map((item, i) => (i === idx ? next : item)).concat(clone);
    });
  }, []);

  const duplicateBrief = useCallback((targetId: string) => {
    setArmedDeleteId(null);
    setDesignBriefs((prev) => duplicateDesignBriefTarget(prev, targetId, allocateDesignBriefId()));
  }, []);

  const deleteBrief = useCallback((targetId: string) => {
    setArmedDeleteId((cur) => (cur === targetId ? null : cur));

    const slashIdx = targetId.indexOf('/');
    if (slashIdx === -1) {
      setDesignBriefs((prev) => prev.filter((b) => b.id !== targetId));
      setSelectedBriefId((cur) => (cur === targetId ? null : cur));
      setSubtaskPath([]);
      return;
    }

    const rootId = targetId.slice(0, slashIdx);
    const path = targetId.slice(slashIdx + 1).split('/');

    setDesignBriefs((prev) =>
      prev.map((b) => {
        if (b.id !== rootId) return b;
        const subtasks = removeSubtaskAtPath(b.subtasks, path);
        return appendDesignBriefActivity({ ...b, subtasks }, b, { subtasks });
      }),
    );

    setExpandedTreeKeys((prev) => {
      const next = new Set(prev);
      collapseTreeBranch(next, rootId, path);
      return next;
    });

    setSelectedBriefId((selId) => {
      if (selId !== rootId) return selId;
      setSubtaskPath((curPath) => {
        const curKey = treeRowKey(rootId, curPath);
        if (curKey === targetId || curKey.startsWith(`${targetId}/`)) return [];
        return curPath;
      });
      return selId;
    });
  }, []);

  const addDesignBriefForStatus = useCallback(
    (status: Status) => {
      const id = allocateDesignBriefId();
      setDesignBriefs((prev) => [...prev, createNewDesignBriefForStatus(status, id, viewerId)]);
    },
    [viewerId],
  );

  const addDesignBriefForGroup = useCallback(
    (groupId: DateGroupId) => {
      const id = allocateDesignBriefId();
      setDesignBriefs((prev) => [...prev, createNewDesignBriefForGroup(groupId, id, new Date(), undefined, viewerId)]);
    },
    [viewerId],
  );

  const addDesignBriefForMember = useCallback(
    (memberId: string) => {
      const id = allocateDesignBriefId();
      setDesignBriefs((prev) => [...prev, createNewDesignBriefForMember(memberId, id, viewerId)]);
    },
    [viewerId],
  );

  const createDesignBrief = useCallback(() => {
    const id = allocateDesignBriefId();
    const brief = createNewDesignBrief(id, undefined, viewerId);
    setDesignBriefs((prev) => [...prev, brief]);
    openBrief(id, []);
    return id;
  }, [openBrief, viewerId]);

  const selectedBrief = selectedBriefId ? briefs.find((b) => b.id === selectedBriefId) : null;
  const panelSubtask =
    selectedBrief && subtaskPath.length > 0 ? getSubtaskAtPath(selectedBrief, subtaskPath) : null;
  const panelBrief =
    selectedBrief && panelSubtask
      ? designBriefFromSubtask(panelSubtask, selectedBrief)
      : selectedBrief;
  const parentLink = selectedBrief ? getParentTaskLink(selectedBrief, subtaskPath) : null;

  const updateDetail = useCallback(
    (_id: string, patch: DesignBriefPatch) => {
      if (!selectedBriefId) return;
      setDesignBriefs((prev) => {
        const idx = prev.findIndex((b) => b.id === selectedBriefId);
        if (idx === -1) return prev;
        const brief = prev[idx];
        if (subtaskPath.length > 0) {
          const sub = getSubtaskAtPath(brief, subtaskPath);
          if (!sub) return prev;
          const merged = mergeSubtaskPatchWithCompletion(sub, patch);
          return prev.map((item, i) => {
            if (i !== idx) return item;
            const subtasks = applyPatchAtSubtaskPath(item.subtasks, subtaskPath, merged);
            return appendDesignBriefActivity({ ...item, subtasks }, item, { subtasks });
          });
        }
        const merged = mergeDesignBriefPatchWithCompletion(brief, patch);
        const next = appendDesignBriefActivity({ ...brief, ...merged }, brief, merged);
        if (!shouldSpawnRecurring(brief, merged)) {
          return prev.map((item, i) => (i === idx ? next : item));
        }
        const clone = spawnRecurringDesignBrief(next, allocateDesignBriefId());
        return prev.map((item, i) => (i === idx ? next : item)).concat(clone);
      });
    },
    [selectedBriefId, subtaskPath],
  );

  return {
    viewerId,
    briefs,
    armedDeleteId,
    expandedTreeKeys,
    selectedBriefId,
    subtaskPath,
    panelBrief,
    parentLink,
    setArmedDeleteId,
    toggleTreeExpand,
    openBrief,
    updateBrief,
    updateSubtaskAtPath,
    addSubtaskAtPath,
    deleteBrief,
    duplicateBrief,
    addDesignBriefForStatus,
    addDesignBriefForGroup,
    addDesignBriefForMember,
    createDesignBrief,
    closeDetail,
    updateDetail,
    setSubtaskPath,
  };
}

export type DesignBriefWorkspace = ReturnType<typeof useDesignBriefWorkspace>;
