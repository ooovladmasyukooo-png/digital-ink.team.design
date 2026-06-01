import { TASK_CREATOR_ASSIGNEE_ID } from '../../tasks/constants';
import { allocateDocumentId, syncDocIdCounterFromTrees } from './documentIds';
import { findDocumentById, findDocumentContext, insertDocumentAt } from './documentTree';
import type { ProjectDocument } from './types';

function duplicateTitle(title: string, kind: ProjectDocument['kind']): string {
  const base = title.trim() || (kind === 'folder' ? 'Папка' : 'Untitled');
  return `${base} (копія)`;
}

function cloneWithNewIds(node: ProjectDocument): ProjectDocument {
  const now = new Date().toISOString();
  return {
    ...node,
    id: allocateDocumentId(),
    title: duplicateTitle(node.title, node.kind),
    content: node.kind === 'folder' ? '' : node.content,
    createdAt: now,
    updatedAt: now,
    creatorId: TASK_CREATOR_ASSIGNEE_ID,
    updatedById: TASK_CREATOR_ASSIGNEE_ID,
    published: false,
    children: node.children.map(cloneWithNewIds),
  };
}

/** Вставляє копію одразу після вихідного вузла (разом із вкладеними дітьми). */
export function duplicateDocumentInTree(
  tree: ProjectDocument[],
  sourceId: string,
): { tree: ProjectDocument[]; newId: string } | null {
  const source = findDocumentById(tree, sourceId);
  const ctx = findDocumentContext(tree, sourceId);
  if (!source || !ctx) return null;

  syncDocIdCounterFromTrees([tree]);
  const clone = cloneWithNewIds(source);
  const result = insertDocumentAt(tree, ctx.parentId, ctx.index + 1, clone);
  if (!result.inserted) return null;
  return { tree: result.tree, newId: clone.id };
}
