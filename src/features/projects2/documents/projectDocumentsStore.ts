import type { ProjectDocumentScope } from './documentScope';
import { syncDocIdCounterFromTrees } from './documentIds';
import { normalizeDocumentTree } from './normalizeDocuments';
import { getSeedDocuments } from './seedDocuments';
import type { ProjectDocument } from './types';

export { allocateDocumentId } from './documentIds';

const STORAGE_PREFIX: Record<ProjectDocumentScope, string> = {
  documents: 'p2-documents-v1:',
  'design-brief': 'p2-design-brief-v1:',
};

const memory = new Map<string, ProjectDocument[]>();

function memoryKey(projectId: string, scope: ProjectDocumentScope): string {
  return `${scope}:${projectId}`;
}

function storageKey(projectId: string, scope: ProjectDocumentScope): string {
  return `${STORAGE_PREFIX[scope]}${projectId}`;
}

function readFromStorage(projectId: string, scope: ProjectDocumentScope): ProjectDocument[] | null {
  try {
    const raw = localStorage.getItem(storageKey(projectId, scope));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectDocument[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeToStorage(projectId: string, scope: ProjectDocumentScope, tree: ProjectDocument[]): void {
  try {
    localStorage.setItem(storageKey(projectId, scope), JSON.stringify(tree));
  } catch {
    /* ignore quota */
  }
}

export function getProjectDocuments(
  projectId: string,
  scope: ProjectDocumentScope = 'documents',
): ProjectDocument[] {
  const key = memoryKey(projectId, scope);
  const stored = memory.has(key) ? memory.get(key)! : readFromStorage(projectId, scope);
  const raw = stored ?? getSeedDocuments(projectId, scope);
  syncDocIdCounterFromTrees([raw, ...memory.values()]);
  const tree = normalizeDocumentTree(raw);
  memory.set(key, tree);
  writeToStorage(projectId, scope, tree);
  return tree;
}

export function setProjectDocuments(
  projectId: string,
  tree: ProjectDocument[],
  scope: ProjectDocumentScope = 'documents',
): void {
  const key = memoryKey(projectId, scope);
  syncDocIdCounterFromTrees([tree, ...memory.values()]);
  const normalized = normalizeDocumentTree(tree);
  memory.set(key, normalized);
  writeToStorage(projectId, scope, normalized);
}
