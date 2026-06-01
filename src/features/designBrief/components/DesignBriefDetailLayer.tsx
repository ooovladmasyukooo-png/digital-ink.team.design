import type { DesignBriefWorkspace } from '../useDesignBriefWorkspace';
import { DesignBriefDetailPage } from './DesignBriefDetailPage';
import { DesignBriefDetailPanel } from './DesignBriefDetailPanel';

interface DesignBriefDetailLayerProps {
  workspace: DesignBriefWorkspace;
  full: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onClose: () => void;
  hideProjectField?: boolean;
}

export function DesignBriefDetailLayer({
  workspace,
  full,
  onExpand,
  onCollapse,
  onClose,
  hideProjectField,
}: DesignBriefDetailLayerProps) {
  const { panelBrief, parentLink, subtaskPath, selectedBriefId, updateDetail, setSubtaskPath } = workspace;

  if (!panelBrief) return null;

  const briefLinkId = selectedBriefId ?? panelBrief.id;

  const parentProps = {
    briefLinkId,
    parentBrief: parentLink ?? undefined,
    parentBriefLabel: subtaskPath.length === 1 ? 'Головне ТЗ' : 'Батьківська підзадача',
    onOpenParentTask: parentLink ? () => setSubtaskPath((path) => path.slice(0, -1)) : undefined,
    onOpenSubtask: (subtaskId: string) => setSubtaskPath((path) => [...path, subtaskId]),
    onUpdate: updateDetail,
  };

  if (full) {
    return (
      <DesignBriefDetailPage brief={panelBrief} onClose={onClose} hideProjectField={hideProjectField} {...parentProps} />
    );
  }

  return (
    <DesignBriefDetailPanel
      brief={panelBrief}
      onClose={onClose}
      onExpand={onExpand}
      hideProjectField={hideProjectField}
      {...parentProps}
    />
  );
}
