import { useCallback, useMemo, useState } from 'react';
import {
  addChildDocument,
  collectDocumentIds,
  findAncestorIds,
  findDocumentById,
  firstSelectableDocumentId,
  moveDocumentInTree,
  removeDocumentFromTree,
  updateDocumentInTree,
} from './documentTree';
import type { DocumentDropPosition } from './documentTree';
import { TASK_CREATOR_ASSIGNEE_ID } from '../../tasks/constants';
import { duplicateDocumentInTree } from './duplicateDocument';
import { syncDocIdCounterFromTrees } from './documentIds';
import type { ProjectDocumentScope } from './documentScope';
import { allocateDocumentId, getProjectDocuments, setProjectDocuments } from './projectDocumentsStore';
import type { ProjectDocument, ProjectDocumentPatch } from './types';

function createEmptyPage(title = 'Untitled'): ProjectDocument {
  const now = new Date().toISOString();
  return {
    id: allocateDocumentId(),
    kind: 'page',
    title,
    content: '',
    icon: null,
    creatorId: TASK_CREATOR_ASSIGNEE_ID,
    createdAt: now,
    updatedById: TASK_CREATOR_ASSIGNEE_ID,
    updatedAt: now,
    published: false,
    children: [],
  };
}

function createEmptyFolder(title = 'Нова папка'): ProjectDocument {
  const now = new Date().toISOString();
  return {
    id: allocateDocumentId(),
    kind: 'folder',
    title,
    content: '',
    icon: null,
    creatorId: TASK_CREATOR_ASSIGNEE_ID,
    createdAt: now,
    updatedById: TASK_CREATOR_ASSIGNEE_ID,
    updatedAt: now,
    published: false,
    children: [],
  };
}

export function useProjectDocuments(projectId: string, scope: ProjectDocumentScope = 'documents') {
  const [tree, setTreeState] = useState<ProjectDocument[]>(() => getProjectDocuments(projectId, scope));
  const [selectedId, setSelectedId] = useState<string | null>(() => firstSelectableDocumentId(tree));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(collectDocumentIds(tree)));

  const persist = useCallback(
    (next: ProjectDocument[]) => {
      setTreeState(next);
      setProjectDocuments(projectId, next, scope);
    },
    [projectId, scope],
  );

  const selected = useMemo(
    () => (selectedId ? findDocumentById(tree, selectedId) : null),
    [tree, selectedId],
  );

  const updateSelected = useCallback(
    (patch: ProjectDocumentPatch) => {
      if (!selectedId) return;
      const safePatch = {
        ...patch,
        updatedAt: new Date().toISOString(),
        updatedById: TASK_CREATOR_ASSIGNEE_ID,
      };
      if (selected?.kind === 'folder') {
        safePatch.content = '';
      }
      persist(updateDocumentInTree(tree, selectedId, safePatch));
    },
    [persist, selected?.kind, selectedId, tree],
  );

  const addPage = useCallback(
    (parentId: string | null) => {
      syncDocIdCounterFromTrees([tree]);
      const page = createEmptyPage();
      const next = addChildDocument(tree, parentId, page);
      persist(next);
      setSelectedId(page.id);
      if (parentId) {
        const ancestors = findAncestorIds(tree, parentId) ?? [];
        setExpandedIds((prev) => {
          const expanded = new Set(prev);
          ancestors.forEach((id) => expanded.add(id));
          expanded.add(parentId);
          return expanded;
        });
      }
    },
    [persist, tree],
  );

  const addFolder = useCallback(
    (parentId: string | null) => {
      syncDocIdCounterFromTrees([tree]);
      const folder = createEmptyFolder();
      const next = addChildDocument(tree, parentId, folder);
      persist(next);
      setSelectedId(folder.id);
      if (parentId) setExpandedIds((prev) => new Set(prev).add(parentId).add(folder.id));
    },
    [persist, tree],
  );

  const deleteDocument = useCallback(
    (id: string) => {
      const next = removeDocumentFromTree(tree, id);
      persist(next);
      setSelectedId((current) => {
        if (current !== id) return current;
        return firstSelectableDocumentId(next);
      });
    },
    [persist, tree],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    deleteDocument(selectedId);
  }, [deleteDocument, selectedId]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const moveDocument = useCallback(
    (dragId: string, targetId: string, position: DocumentDropPosition) => {
      const next = moveDocumentInTree(tree, dragId, targetId, position);
      if (!next) return;
      persist(next);
      setExpandedIds((prev) => {
        const expanded = new Set(prev);
        if (position === 'inside' || position === 'append-child') {
          expanded.add(targetId);
        }
        const ancestors = findAncestorIds(next, dragId) ?? [];
        ancestors.forEach((id) => expanded.add(id));
        expanded.add(dragId);
        return expanded;
      });
    },
    [persist, tree],
  );

  const duplicateDocument = useCallback(
    (sourceId: string) => {
      const result = duplicateDocumentInTree(tree, sourceId);
      if (!result) return;
      persist(result.tree);
      setSelectedId(result.newId);
      const ancestors = findAncestorIds(result.tree, result.newId) ?? [];
      const clone = findDocumentById(result.tree, result.newId);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestors.forEach((id) => next.add(id));
        if (clone) collectDocumentIds([clone]).forEach((id) => next.add(id));
        return next;
      });
    },
    [persist, tree],
  );

  const resetForProject = useCallback((id: string) => {
    const loaded = getProjectDocuments(id, scope);
    setTreeState(loaded);
    setSelectedId(firstSelectableDocumentId(loaded));
    setExpandedIds(new Set(collectDocumentIds(loaded)));
  }, [scope]);

  return {
    tree,
    selected,
    selectedId,
    setSelectedId,
    expandedIds,
    toggleExpand,
    updateSelected,
    addPage,
    addFolder,
    deleteSelected,
    deleteDocument,
    moveDocument,
    duplicateDocument,
    resetForProject,
  };
}
