import type { ProjectDocumentScope } from './documentScope';

const PUBLIC_PATH_BY_SCOPE: Record<ProjectDocumentScope, string> = {
  documents: '/projects/documents/public',
  'design-brief': '/projects/design-brief/public',
};

export function buildDocumentPublicLink(
  projectId: string,
  documentId: string,
  scope: ProjectDocumentScope = 'documents',
): string {
  const q = new URLSearchParams({ project: projectId, id: documentId });
  return `${PUBLIC_PATH_BY_SCOPE[scope]}?${q.toString()}`;
}

export function parseDocumentPublicSearch(
  search: string,
): { projectId: string; documentId: string } | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const projectId = params.get('project')?.trim();
  const documentId = params.get('id')?.trim();
  if (!projectId || !documentId) return null;
  return { projectId, documentId };
}

export function documentScopeFromPublicPath(pathname: string): ProjectDocumentScope | null {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === PUBLIC_PATH_BY_SCOPE.documents) return 'documents';
  if (path === PUBLIC_PATH_BY_SCOPE['design-brief']) return 'design-brief';
  return null;
}

export function isDocumentPublicPath(pathname: string): boolean {
  return documentScopeFromPublicPath(pathname) !== null;
}
