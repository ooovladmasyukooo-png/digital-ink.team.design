import type { Project, ProjectClientArticleShare, ProjectPatch } from './types';

export function newClientArticleShareId(): string {
  return `article-share-${Date.now().toString(36)}`;
}

export function emptyClientArticleShare(articleId: string): ProjectClientArticleShare {
  return {
    id: newClientArticleShareId(),
    articleId,
    comment: '',
    sentAt: todayShareDateLabel(),
  };
}

export function normalizeClientArticleShares(
  shares: ProjectClientArticleShare[] | undefined,
): ProjectClientArticleShare[] {
  if (!shares?.length) return [];
  return shares.map((share, index) => ({
    id: share.id || `article-share-${index}`,
    articleId: share.articleId,
    comment: share.comment ?? '',
    sentAt: share.sentAt ?? '',
  }));
}

export function todayShareDateLabel(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}

export function shortShareDateLabel(sentAt: string): string {
  const [day, month] = sentAt.split('.');
  if (!day || !month) return sentAt;
  return `${day}.${month}`;
}

export function normalizeProjectClientFields(project: Pick<Project, 'clientArticleShares'>) {
  return {
    clientArticleShares: normalizeClientArticleShares(project.clientArticleShares),
  };
}
