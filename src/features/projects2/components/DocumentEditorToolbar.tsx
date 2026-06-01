import { useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { formatTaskDateTime } from '../../tasks/dateDisplay';
import { teamById } from '../../tasks/taskOptions';
import type { ProjectDocumentScope } from '../documents/documentScope';
import { buildDocumentPublicLink } from '../documents/documentPaths';
import { isFolder, isPage } from '../documents/types';
import type { ProjectDocument, ProjectDocumentPatch } from '../documents/types';
import { DocumentDeleteButton } from './DocumentDeleteButton';
import styles from '../projects2.module.css';

interface DocumentEditorToolbarProps {
  projectId: string;
  scope?: ProjectDocumentScope;
  document: ProjectDocument;
  onUpdate: (patch: ProjectDocumentPatch) => void;
  onDelete: () => void;
}

export function DocumentEditorToolbar({
  projectId,
  scope = 'documents',
  document,
  onUpdate,
  onDelete,
}: DocumentEditorToolbarProps) {
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);

  const folder = isFolder(document);
  const page = isPage(document);
  const creator = teamById[document.creatorId];
  const creatorName = creator?.name ?? document.creatorId;
  const createdAtLabel = formatTaskDateTime(document.createdAt);
  const publicHref = buildDocumentPublicLink(projectId, document.id, scope);
  const publicUrl = `${window.location.origin}${publicHref}`;

  const onShare = async () => {
    const text = `${document.title}\n${publicUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setShareNote(document.published ? 'Публічне посилання' : 'Скопійовано');
      window.setTimeout(() => setShareNote(null), 2000);
    } catch {
      setShareNote('Не вдалося скопіювати');
      window.setTimeout(() => setShareNote(null), 2000);
    }
  };

  const publishToggle = page ? (
    <label
      className={cx(styles['p2-doc-publish'], document.published && styles['p2-doc-publish-on'])}
      title="Доступ без входу в CRM"
    >
      <input
        type="checkbox"
        className={styles['p2-doc-publish-input']}
        checked={document.published}
        onChange={(event) => onUpdate({ published: event.target.checked })}
      />
      <span className={styles['p2-doc-publish-track']} aria-hidden>
        <span className={styles['p2-doc-publish-thumb']} />
      </span>
      <span className={styles['p2-doc-publish-label']}>
        {document.published ? 'Опубліковано' : 'Публікувати'}
      </span>
    </label>
  ) : null;

  return (
    <div className={styles['p2-doc-editor-toolbar']}>
      <div className={styles['p2-doc-editor-toolbar-start']}>
        {folder ? <span className={styles['p2-doc-folder-badge']}>Папка</span> : null}
      </div>

      <div className={styles['p2-doc-editor-toolbar-end']}>
        {publishToggle}
        <span className={styles['p2-doc-creator-av']} title={creatorName} aria-label={`Автор: ${creatorName}`}>
          <Avatar name={creatorName} hue={creator?.hue ?? 0} size="sm" />
        </span>
        <time className={styles['p2-doc-created']} dateTime={document.createdAt} title={createdAtLabel}>
          {createdAtLabel}
        </time>
        <div className={styles['p2-doc-editor-toolbar-actions']}>
          <a
            href={publicHref}
            className={styles['p2-doc-open-ext']}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={document.published ? 'Відкрити публічну сторінку' : 'Відкрити сторінку (потрібна публікація)'}
            title={document.published ? 'Відкрити публічну сторінку' : 'Спочатку увімкніть публікацію'}
          >
            {Icons.openExternal}
          </a>
          <button
            type="button"
            className={styles['p2-doc-share']}
            aria-label={shareNote ?? 'Поділитися'}
            title={shareNote ?? 'Поділитися'}
            onClick={onShare}
          >
            {Icons.share}
          </button>
          <DocumentDeleteButton
            armed={deleteArmed}
            onArm={setDeleteArmed}
            onDelete={onDelete}
            itemLabel={folder ? 'folder' : 'page'}
          />
        </div>
      </div>
    </div>
  );
}
