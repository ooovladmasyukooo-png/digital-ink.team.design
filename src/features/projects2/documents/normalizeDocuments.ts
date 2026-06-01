import { TASK_CREATOR_ASSIGNEE_ID } from '../../tasks/constants';
import { deduplicateDocumentIds } from './documentIds';
import type { ProjectDocument, ProjectDocumentKind } from './types';

function normalizeKind(raw: ProjectDocument): ProjectDocumentKind {
  if (raw.kind === 'folder' || raw.kind === 'page') return raw.kind;
  return 'page';
}

export function normalizeDocumentTree(nodes: ProjectDocument[]): ProjectDocument[] {
  const unique = deduplicateDocumentIds(nodes);
  return unique.map((node) => {
    const kind = normalizeKind(node);
    const updatedAt = node.updatedAt ?? new Date().toISOString();
    const createdAt = node.createdAt ?? updatedAt;
    const creatorId = node.creatorId ?? TASK_CREATOR_ASSIGNEE_ID;
    return {
      ...node,
      kind,
      content: kind === 'folder' ? '' : node.content,
      creatorId,
      createdAt,
      updatedById: node.updatedById ?? creatorId,
      updatedAt,
      published: kind === 'page' ? Boolean(node.published) : false,
      children: normalizeDocumentTree(node.children),
    };
  });
}
