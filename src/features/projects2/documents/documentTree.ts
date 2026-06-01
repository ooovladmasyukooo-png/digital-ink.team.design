import { isPage } from './types';
import type { ProjectDocument, ProjectDocumentPatch } from './types';

export function findDocumentById(
  nodes: ProjectDocument[],
  id: string,
): ProjectDocument | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findDocumentById(node.children, id);
    if (found) return found;
  }
  return null;
}

export function updateDocumentInTree(
  nodes: ProjectDocument[],
  id: string,
  patch: ProjectDocumentPatch,
): ProjectDocument[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...patch, updatedAt: patch.updatedAt ?? new Date().toISOString() };
    }
    if (node.children.length === 0) return node;
    return { ...node, children: updateDocumentInTree(node.children, id, patch) };
  });
}

export function addChildDocument(
  nodes: ProjectDocument[],
  parentId: string | null,
  child: ProjectDocument,
): ProjectDocument[] {
  if (parentId === null) return [...nodes, child];
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, child] };
    }
    if (node.children.length === 0) return node;
    return { ...node, children: addChildDocument(node.children, parentId, child) };
  });
}

export function removeDocumentFromTree(nodes: ProjectDocument[], id: string): ProjectDocument[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      children: removeDocumentFromTree(node.children, id),
    }));
}

export function collectDocumentIds(nodes: ProjectDocument[]): string[] {
  const out: string[] = [];
  const walk = (list: ProjectDocument[]) => {
    for (const node of list) {
      out.push(node.id);
      walk(node.children);
    }
  };
  walk(nodes);
  return out;
}

export function firstPageId(nodes: ProjectDocument[]): string | null {
  for (const node of nodes) {
    if (isPage(node)) return node.id;
    const nested = firstPageId(node.children);
    if (nested) return nested;
  }
  return null;
}

/** Перша сторінка або перший вузол (папка), якщо сторінок немає. */
export function firstSelectableDocumentId(nodes: ProjectDocument[]): string | null {
  if (nodes.length === 0) return null;
  return firstPageId(nodes) ?? nodes[0]?.id ?? null;
}

export function containsDocumentId(node: ProjectDocument, id: string): boolean {
  if (node.id === id) return true;
  return node.children.some((child) => containsDocumentId(child, id));
}

/** Усі id предків вузла (шлях від кореня до батька). */
export function findAncestorIds(nodes: ProjectDocument[], targetId: string): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return [];
    if (node.children.length > 0) {
      const nested = findAncestorIds(node.children, targetId);
      if (nested !== null) return [node.id, ...nested];
    }
  }
  return null;
}

export type DocumentDropPosition = 'before' | 'after' | 'inside' | 'append-child';

export type DocumentNodeContext = {
  parentId: string | null;
  index: number;
};

export function findDocumentContext(
  nodes: ProjectDocument[],
  id: string,
  parentId: string | null = null,
): DocumentNodeContext | null {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === id) return { parentId, index };
    const nested = findDocumentContext(node.children, id, node.id);
    if (nested) return nested;
  }
  return null;
}

export function removeDocumentNode(
  nodes: ProjectDocument[],
  id: string,
): { removed: ProjectDocument | null; tree: ProjectDocument[] } {
  let removed: ProjectDocument | null = null;

  const tree = nodes.flatMap((node) => {
    if (node.id === id) {
      removed = node;
      return [];
    }
    if (node.children.length === 0) return [node];
    const inner = removeDocumentNode(node.children, id);
    if (inner.removed) {
      removed = inner.removed;
      return [{ ...node, children: inner.tree }];
    }
    return [node];
  });

  return { removed, tree };
}

export type InsertDocumentResult = { tree: ProjectDocument[]; inserted: boolean };

export function insertDocumentAt(
  nodes: ProjectDocument[],
  parentId: string | null,
  index: number,
  doc: ProjectDocument,
): InsertDocumentResult {
  if (parentId === null) {
    const next = [...nodes];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, doc);
    return { tree: next, inserted: true };
  }

  let inserted = false;
  const tree = nodes.map((node) => {
    if (node.id === parentId) {
      inserted = true;
      const children = [...node.children];
      children.splice(Math.max(0, Math.min(index, children.length)), 0, doc);
      return { ...node, children };
    }
    if (node.children.length === 0) return node;
    const inner = insertDocumentAt(node.children, parentId, index, doc);
    if (inner.inserted) inserted = true;
    return { ...node, children: inner.tree };
  });

  return { tree, inserted };
}

export const ROOT_TREE_START = '__p2_root_start__';
export const ROOT_TREE_END = '__p2_root_end__';

function containsDocumentInTree(nodes: ProjectDocument[], id: string): boolean {
  return findDocumentById(nodes, id) !== null;
}

/** Перемістити сторінку: перед/після цілі або всередину неї. */
export function moveDocumentInTree(
  tree: ProjectDocument[],
  dragId: string,
  targetId: string,
  position: DocumentDropPosition,
): ProjectDocument[] | null {
  if (dragId === targetId) return null;

  const dragNode = findDocumentById(tree, dragId);
  if (!dragNode) return null;
  if (containsDocumentId(dragNode, targetId)) return null;

  const { removed, tree: withoutDrag } = removeDocumentNode(tree, dragId);
  if (!removed) return null;

  if (targetId === ROOT_TREE_START) {
    const result = insertDocumentAt(withoutDrag, null, 0, removed);
    return result.inserted && containsDocumentInTree(result.tree, dragId) ? result.tree : null;
  }

  if (targetId === ROOT_TREE_END) {
    const result = insertDocumentAt(withoutDrag, null, withoutDrag.length, removed);
    return result.inserted && containsDocumentInTree(result.tree, dragId) ? result.tree : null;
  }

  if (position === 'inside' || position === 'append-child') {
    const parent = findDocumentById(withoutDrag, targetId);
    if (!parent) return null;
    const index = position === 'append-child' ? parent.children.length : parent.children.length;
    const result = insertDocumentAt(withoutDrag, targetId, index, removed);
    return result.inserted && containsDocumentInTree(result.tree, dragId) ? result.tree : null;
  }

  const ctx = findDocumentContext(withoutDrag, targetId);
  if (!ctx) return null;

  const index = position === 'before' ? ctx.index : ctx.index + 1;
  const result = insertDocumentAt(withoutDrag, ctx.parentId, index, removed);
  return result.inserted && containsDocumentInTree(result.tree, dragId) ? result.tree : null;
}
