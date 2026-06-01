import { useEffect, useMemo } from 'react';
import { formatTaskDateTime } from '../../tasks/dateDisplay';
import { teamById } from '../../tasks/taskOptions';
import type { ProjectDocumentScope } from '../documents/documentScope';
import { PROJECT_DOCUMENT_SCOPE_LABEL } from '../documents/documentScope';
import { findDocumentById } from '../documents/documentTree';
import { documentScopeFromPublicPath, parseDocumentPublicSearch } from '../documents/documentPaths';
import { getProjectDocuments } from '../documents/projectDocumentsStore';
import { renderSimpleMarkdown } from '../documents/simpleMarkdown';
import { isPage } from '../documents/types';
import styles from '../projects2.module.css';

interface DocumentPublicPageProps {
  scope?: ProjectDocumentScope;
}

export function DocumentPublicPage({ scope: scopeProp }: DocumentPublicPageProps) {
  const scope =
    scopeProp ?? documentScopeFromPublicPath(window.location.pathname) ?? 'documents';
  const scopeLabel = PROJECT_DOCUMENT_SCOPE_LABEL[scope];
  const params = parseDocumentPublicSearch(window.location.search);
  const doc = useMemo(() => {
    if (!params) return null;
    const tree = getProjectDocuments(params.projectId, scope);
    return findDocumentById(tree, params.documentId);
  }, [params?.documentId, params?.projectId, scope]);

  useEffect(() => {
    if (doc?.published && isPage(doc)) {
      window.document.title = `${doc.title} · ${scopeLabel}`;
      return;
    }
    window.document.title = scopeLabel;
  }, [doc?.published, doc?.title, scopeLabel]);

  if (!params) {
    return (
      <div className={styles['p2-doc-public-page']}>
        <p className={styles['p2-doc-public-empty']}>Невірне посилання на документ.</p>
      </div>
    );
  }

  if (!doc || !isPage(doc) || !doc.published) {
    return (
      <div className={styles['p2-doc-public-page']}>
        <p className={styles['p2-doc-public-empty']}>Цей документ недоступний або ще не опублікований.</p>
      </div>
    );
  }

  const creator = teamById[doc.creatorId];
  const createdAtLabel = formatTaskDateTime(doc.createdAt);
  const html = renderSimpleMarkdown(doc.content);

  return (
    <div className={styles['p2-doc-public-page']}>
      <header className={styles['p2-doc-public-head']}>
        <span className={styles['p2-doc-public-brand']}>{scopeLabel}</span>
      </header>
      <main className={styles['p2-doc-public-main']}>
        <h1 className={styles['p2-doc-public-title']}>{doc.title}</h1>
        <p className={styles['p2-doc-public-meta-line']}>
          {creator?.name ?? doc.creatorId} · {createdAtLabel}
        </p>
        <div
          className={styles['p2-doc-public-body']}
          dangerouslySetInnerHTML={{
            __html: html || '<p class="p2-doc-preview-empty">Порожня сторінка</p>',
          }}
        />
      </main>
    </div>
  );
}
