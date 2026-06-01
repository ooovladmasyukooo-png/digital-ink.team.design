import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatTaskDateTime } from '../dateDisplay';
import { resolveDesignBriefCreatedAt } from '../designBriefCreatedAt';
import styles from '../designBrief.module.css';
import type { DesignBrief, DesignBriefPatch } from '../types';
import { teamById } from '../designBriefOptions';
import { DesignBriefDetailContent } from './DesignBriefDetailContent';
import { DesignBriefDetailToolbar } from './DesignBriefDetailToolbar';

interface DesignBriefDetailPanelProps {
  brief: DesignBrief;
  briefLinkId: string;
  onClose: () => void;
  onExpand: () => void;
  onUpdate: (id: string, patch: DesignBriefPatch) => void;
  onOpenSubtask: (subtaskId: string) => void;
  parentBrief?: Pick<DesignBrief, 'id' | 'title'>;
  parentBriefLabel?: string;
  onOpenParentTask?: () => void;
  hideProjectField?: boolean;
}

export function DesignBriefDetailPanel({
  brief,
  briefLinkId,
  onClose,
  onExpand,
  onUpdate,
  onOpenSubtask,
  parentBrief,
  parentBriefLabel,
  onOpenParentTask,
  hideProjectField,
}: DesignBriefDetailPanelProps) {
  const creator = teamById[brief.creatorId];
  const creatorName = creator?.name ?? brief.creatorId;
  const createdAtIso = resolveDesignBriefCreatedAt(brief);
  const createdAtLabel = formatTaskDateTime(createdAtIso);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <>
      <button type="button" className={styles['db-drawer-backdrop']} aria-label="Закрити картку задачі" onClick={onClose} />
      <aside className={styles['db-drawer']} role="dialog" aria-modal="true" aria-label={brief.title}>
        <DesignBriefDetailToolbar
          brief={brief}
          briefLinkId={briefLinkId}
          variant="drawer"
          onClose={onClose}
          onExpand={onExpand}
          onUpdate={(patch) => onUpdate(brief.id, patch)}
          creatorName={creatorName}
          creatorHue={creator?.hue ?? 0}
          createdAtIso={createdAtIso}
          createdAtLabel={createdAtLabel}
        />
        <DesignBriefDetailContent
          brief={brief}
          onUpdate={onUpdate}
          onOpenSubtask={onOpenSubtask}
          parentBrief={parentBrief}
          parentBriefLabel={parentBriefLabel}
          onOpenParentTask={onOpenParentTask}
          hideProjectField={hideProjectField}
        />
      </aside>
    </>,
    document.body,
  );
}
