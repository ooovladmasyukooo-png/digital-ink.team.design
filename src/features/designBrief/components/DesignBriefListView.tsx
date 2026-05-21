import { useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { buildDesignBriefGroups } from '../designBriefGroups';
import type { DesignBriefWorkspace } from '../useDesignBriefWorkspace';
import styles from '../designBrief.module.css';
import { DesignBriefStatusGroupSection } from './DesignBriefStatusGroupSection';
import { DesignBriefListHeader } from './DesignBriefListHeader';
import { DesignBriefViewerSwitcher } from './DesignBriefViewerSwitcher';

interface DesignBriefListViewProps {
  workspace: DesignBriefWorkspace;
  viewerId: string;
  onViewerChange: (memberId: string) => void;
  onCreate: () => void;
}

export function DesignBriefListView({
  workspace,
  viewerId,
  onViewerChange,
  onCreate,
}: DesignBriefListViewProps) {
  const {
    briefs,
    armedDeleteId,
    expandedTreeKeys,
    setArmedDeleteId,
    toggleTreeExpand,
    openBrief,
    updateBrief,
    updateSubtaskAtPath,
    addSubtaskAtPath,
    deleteBrief,
    addDesignBriefForStatus,
  } = workspace;

  const groups = useMemo(
    () => buildDesignBriefGroups(briefs, viewerId),
    [briefs, viewerId],
  );

  const totalCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.tasks.length, 0),
    [groups],
  );

  return (
    <div className={styles['db-design-brief-shell']}>
      <DesignBriefListHeader count={totalCount} onCreate={onCreate} />
      <div className={styles['db-design-brief-subhead']}>
        <DesignBriefViewerSwitcher viewerId={viewerId} onViewerChange={onViewerChange} />
      </div>
      <div className={cx(styles['db-by-date'], styles['db-personal'], styles['db-design-brief-list'])}>
        <div className={styles['db-table']}>
          {groups.map((group) => (
            <DesignBriefStatusGroupSection
              key={group.status}
              status={group.status}
              label={group.label}
              tasks={group.tasks}
              armedDeleteId={armedDeleteId}
              expandedTreeKeys={expandedTreeKeys}
              onToggleTreeExpand={toggleTreeExpand}
              onArmDelete={setArmedDeleteId}
              onDelete={deleteBrief}
              onUpdate={updateBrief}
              onUpdateSubtask={updateSubtaskAtPath}
              onAddSubtask={addSubtaskAtPath}
              onAdd={addDesignBriefForStatus}
              onOpenTask={openBrief}
              listVariant="personal"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
