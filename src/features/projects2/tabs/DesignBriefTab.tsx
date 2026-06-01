import { useCallback, useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { DesignBriefDetailLayer } from '../../designBrief/components/DesignBriefDetailLayer';
import { DesignBriefStatusGroupSection } from '../../designBrief/components/DesignBriefStatusGroupSection';
import { buildDesignBriefTaskLink } from '../../designBrief/designBriefPaths';
import { buildProjectDesignBriefStatusGroups } from '../../designBrief/projectDesignBrief';
import { useProjectDesignBriefWorkspace } from '../../designBrief/useProjectDesignBriefWorkspace';
import dbStyles from '../../designBrief/designBrief.module.css';

interface DesignBriefTabProps {
  projectId: string;
}

export function DesignBriefTab({ projectId }: DesignBriefTabProps) {
  const workspace = useProjectDesignBriefWorkspace(projectId);

  const groups = useMemo(
    () => buildProjectDesignBriefStatusGroups(workspace.briefs),
    [workspace.briefs],
  );

  const hasAnyBrief = workspace.briefs.length > 0;

  const expandBrief = useCallback(() => {
    const id = workspace.selectedBriefId ?? workspace.panelBrief?.id;
    if (!id) return;
    window.open(buildDesignBriefTaskLink(id), '_blank', 'noopener,noreferrer');
  }, [workspace.panelBrief?.id, workspace.selectedBriefId]);

  return (
    <>
      <div
        className={cx(
          dbStyles['db-by-date'],
          dbStyles['db-personal'],
          dbStyles['db-project-status-list'],
        )}
      >
        <div className={dbStyles['db-table']}>
          {!hasAnyBrief ? (
            <p className={dbStyles['db-empty-state']}>Немає ТЗ для цього проєкту.</p>
          ) : (
            groups.map((group) => (
              <DesignBriefStatusGroupSection
                key={group.status}
                status={group.status}
                label={group.label}
                tasks={group.tasks}
                armedDeleteId={workspace.armedDeleteId}
                expandedTreeKeys={workspace.expandedTreeKeys}
                onToggleTreeExpand={workspace.toggleTreeExpand}
                onArmDelete={workspace.setArmedDeleteId}
                onDelete={workspace.deleteBrief}
                onDuplicate={workspace.duplicateBrief}
                onUpdate={workspace.updateBrief}
                onUpdateSubtask={workspace.updateSubtaskAtPath}
                onAddSubtask={workspace.addSubtaskAtPath}
                onAdd={workspace.addDesignBriefForStatus}
                onOpenTask={workspace.openBrief}
                listVariant={group.status === 'done' ? 'withCompleted' : 'personal'}
              />
            ))
          )}
        </div>
      </div>
      <DesignBriefDetailLayer
        workspace={workspace}
        full={false}
        hideProjectField
        onExpand={expandBrief}
        onCollapse={workspace.closeDetail}
        onClose={workspace.closeDetail}
      />
    </>
  );
}
