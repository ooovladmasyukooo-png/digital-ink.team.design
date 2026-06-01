export type ProjectDocumentKind = 'page' | 'folder';

export type ProjectDocument = {
  id: string;
  kind: ProjectDocumentKind;
  title: string;
  content: string;
  /** Емодзі або null — іконка сторінки; для папок ігнорується */
  icon: string | null;
  creatorId: string;
  createdAt: string;
  updatedById: string;
  updatedAt: string;
  /** Публічна сторінка без входу в CRM; лише для kind === 'page' */
  published: boolean;
  children: ProjectDocument[];
};

export type ProjectDocumentPatch = Partial<
  Pick<
    ProjectDocument,
    | 'title'
    | 'content'
    | 'icon'
    | 'updatedAt'
    | 'updatedById'
    | 'kind'
    | 'creatorId'
    | 'createdAt'
    | 'published'
  >
>;

export function isFolder(node: Pick<ProjectDocument, 'kind'>): boolean {
  return node.kind === 'folder';
}

export function isPage(node: Pick<ProjectDocument, 'kind'>): boolean {
  return node.kind === 'page';
}
