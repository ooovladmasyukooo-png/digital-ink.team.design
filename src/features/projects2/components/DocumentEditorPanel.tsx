import { Avatar } from '../../../shared/components/Avatar';
import { cx } from '../../../shared/styles/cx';
import type { ProjectDocumentScope } from '../documents/documentScope';
import { formatDocumentDateTime } from '../documents/dateDisplay';
import { isFolder } from '../documents/types';
import type { ProjectDocument, ProjectDocumentPatch } from '../documents/types';
import { teamById } from '../../tasks/taskOptions';
import { DocumentEditorToolbar } from './DocumentEditorToolbar';
import { DocumentPageIconPicker } from './DocumentPageIconPicker';
import { DocumentBlockEditor } from './DocumentBlockEditor';
import styles from '../projects2.module.css';

interface DocumentEditorPanelProps {
  projectId: string;
  scope?: ProjectDocumentScope;
  document: ProjectDocument | null;
  onUpdate: (patch: ProjectDocumentPatch) => void;
  onDelete: () => void;
}

export function DocumentEditorPanel({
  projectId,
  scope = 'documents',
  document,
  onUpdate,
  onDelete,
}: DocumentEditorPanelProps) {
  if (!document) {
    return (
      <div className={styles['p2-doc-editor-empty']}>
        <p>Оберіть елемент у дереві зліва.</p>
      </div>
    );
  }

  const folder = isFolder(document);
  const updater = teamById[document.updatedById];
  const updaterName = updater?.name ?? document.updatedById;
  const updatedLabel = formatDocumentDateTime(document.updatedAt);

  return (
    <section className={styles['p2-doc-editor']} aria-label={folder ? 'Папка' : 'Редактор сторінки'}>
      <DocumentEditorToolbar
        projectId={projectId}
        scope={scope}
        document={document}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      <div className={styles['p2-doc-editor-scroll']}>
        <div className={cx(styles['p2-doc-head'], folder && styles['p2-doc-head-folder'])}>
          {!folder ? (
            <DocumentPageIconPicker document={document} onIconChange={(icon) => onUpdate({ icon })} />
          ) : null}
          <input
            className={styles['p2-doc-title']}
            value={document.title}
            placeholder={folder ? 'Назва папки' : 'Untitled'}
            aria-label={folder ? 'Назва папки' : 'Заголовок сторінки'}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
          <div className={styles['p2-doc-head-meta']}>
            <span className={styles['p2-doc-meta-av']} title={updaterName} aria-label={`Оновив: ${updaterName}`}>
              <Avatar name={updaterName} hue={updater?.hue ?? 0} size="sm" />
            </span>
            <span className={styles['p2-doc-meta-time']}>Оновлено {updatedLabel}</span>
            {folder ? (
              <>
                <span className={styles['p2-doc-meta-sep']}>·</span>
                <span>{document.children.length} елементів</span>
              </>
            ) : null}
          </div>
        </div>

        {folder ? (
          <p className={styles['p2-doc-folder-hint']}>
            Папка лише групує сторінки та інші папки. Додайте вміст кнопками <strong>+</strong> (сторінка) та{' '}
            <strong>папка</strong> у дереві.
          </p>
        ) : (
          <div className={styles['p2-doc-body-zone']}>
            <DocumentBlockEditor
              documentId={document.id}
              value={document.content}
              onChange={(content) => onUpdate({ content })}
            />
          </div>
        )}
      </div>
    </section>
  );
}
