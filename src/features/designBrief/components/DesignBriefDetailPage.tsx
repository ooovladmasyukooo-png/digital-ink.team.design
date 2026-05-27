import { useEffect } from 'react';
import { resolveDesignBriefCreatedAt } from '../designBriefCreatedAt';
import { formatTaskDateTime } from '../dateDisplay';
import { designBriefItemDocumentTitle } from '../designBriefPaths';
import styles from '../designBrief.module.css';
import type { DesignBrief, DesignBriefPatch } from '../types';
import { teamById } from '../designBriefOptions';
import { DesignBriefDetailContent } from './DesignBriefDetailContent';
import { DesignBriefDetailToolbar } from './DesignBriefDetailToolbar';

interface DesignBriefDetailPageProps {
  brief: DesignBrief;
  briefLinkId: string;
  onClose: () => void;
  onUpdate: (id: string, patch: DesignBriefPatch) => void;
  onOpenSubtask: (subtaskId: string) => void;
  parentBrief?: Pick<DesignBrief, 'id' | 'title'>;
  parentBriefLabel?: string;
  onOpenParentTask?: () => void;
}

export function DesignBriefDetailPage({
  brief,
  briefLinkId,
  onClose,
  onUpdate,
  onOpenSubtask,
  parentBrief,
  parentBriefLabel,
  onOpenParentTask,
}: DesignBriefDetailPageProps) {
  const creator = teamById[brief.creatorId];
  const creatorName = creator?.name ?? brief.creatorId;
  const createdAtIso = resolveDesignBriefCreatedAt(brief);
  const createdAtLabel = formatTaskDateTime(createdAtIso);

  useEffect(() => {
    document.title = designBriefItemDocumentTitle(brief.title, brief.id);
    return () => {
      document.title = 'Задачі · Aurora CRM';
    };
  }, [brief.id, brief.title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles['db-detail-page']}>
      <div className={styles['db-detail-page-main']}>
        <DesignBriefDetailToolbar
          brief={brief}
          briefLinkId={briefLinkId}
          variant="page"
          onClose={onClose}
          onUpdate={(patch) => onUpdate(brief.id, patch)}
          creatorName={creatorName}
          creatorHue={creator?.hue ?? 0}
          createdAtIso={createdAtIso}
          createdAtLabel={createdAtLabel}
        />
        <div className={styles['db-detail-page-inner']}>
          <DesignBriefDetailContent
            brief={brief}
            onUpdate={onUpdate}
            onOpenSubtask={onOpenSubtask}
            parentBrief={parentBrief}
            parentBriefLabel={parentBriefLabel}
            onOpenParentTask={onOpenParentTask}
            scrollClassName={styles['db-detail-page-scroll']}
            bodyClassName={styles['db-drawer-body']}
            footerClassName={styles['db-drawer-footer']}
          />
        </div>
      </div>
    </div>
  );
}
