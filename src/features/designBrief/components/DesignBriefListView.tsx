import { useMemo } from 'react';
import { cx } from '../../../shared/styles/cx';
import { ARCHIVE_GROUP_ORDER, groupDesignBriefArchive } from '../designBriefArchiveGroups';
import { DATE_GROUP_ORDER, groupDesignBriefsByDate } from '../designBriefDateGroups';
import { buildDesignBriefGroups } from '../designBriefGroups';
import { buildDesignBriefPeopleGroups } from '../designBriefPeopleGroups';
import type { DesignBriefWorkspace } from '../useDesignBriefWorkspace';
import styles from '../designBrief.module.css';
import type { DesignBriefViewTabId } from '../types';
import { DesignBriefArchiveGroupSection } from './DesignBriefArchiveGroupSection';
import { DesignBriefDateGroupSection } from './DesignBriefDateGroupSection';
import { DesignBriefListHeader } from './DesignBriefListHeader';
import { DesignBriefPeopleGroupSection } from './DesignBriefPeopleGroupSection';
import { DesignBriefStatusGroupSection } from './DesignBriefStatusGroupSection';
import { DesignBriefTabsBar } from './DesignBriefTabsBar';

interface DesignBriefListViewProps {
  workspace: DesignBriefWorkspace;
  activeTab: DesignBriefViewTabId;
  onTab: (tabId: DesignBriefViewTabId) => void;
  viewerId: string;
  onViewerChange: (memberId: string) => void;
  onCreate: () => void;
}

export function DesignBriefListView({
  workspace,
  activeTab,
  onTab,
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
    duplicateBrief,
    addDesignBriefForStatus,
    addDesignBriefForGroup,
    addDesignBriefForMember,
  } = workspace;

  const statusGroups = useMemo(
    () => buildDesignBriefGroups(briefs, viewerId),
    [briefs, viewerId],
  );

  const dateGrouped = useMemo(
    () => groupDesignBriefsByDate(briefs, new Date(), viewerId),
    [briefs, viewerId],
  );

  const peopleGroups = useMemo(
    () => buildDesignBriefPeopleGroups(briefs, viewerId),
    [briefs, viewerId],
  );

  const archiveGrouped = useMemo(
    () => groupDesignBriefArchive(briefs, new Date(), viewerId),
    [briefs, viewerId],
  );

  const totalCount = useMemo(() => {
    switch (activeTab) {
      case 'by-date':
        return DATE_GROUP_ORDER.reduce((sum, groupId) => sum + dateGrouped[groupId].length, 0);
      case 'by-status':
        return statusGroups.reduce((sum, group) => sum + group.tasks.length, 0);
      case 'by-people':
        return peopleGroups.reduce((sum, group) => sum + group.tasks.length, 0);
      case 'archive':
        return ARCHIVE_GROUP_ORDER.reduce((sum, groupId) => sum + archiveGrouped[groupId].length, 0);
      default:
        return 0;
    }
  }, [activeTab, archiveGrouped, dateGrouped, peopleGroups, statusGroups]);

  const hasAnyArchive = useMemo(
    () => ARCHIVE_GROUP_ORDER.some((groupId) => archiveGrouped[groupId].length > 0),
    [archiveGrouped],
  );

  const listClassName = cx(
    styles['db-by-date'],
    styles['db-design-brief-list'],
    activeTab === 'by-status' && styles['db-personal'],
    activeTab === 'archive' && styles['db-archive'],
  );

  return (
    <div className={styles['db-design-brief-shell']}>
      <header className={styles['db-stacked-header']}>
        <DesignBriefListHeader count={totalCount} onCreate={onCreate} />
        <DesignBriefTabsBar
          activeTab={activeTab}
          onTab={onTab}
          viewerId={viewerId}
          onViewerChange={onViewerChange}
        />
      </header>
      <div className={listClassName}>
        {activeTab === 'by-date' ? (
          <div className={styles['db-table']}>
            {DATE_GROUP_ORDER.map((groupId) => (
              <DesignBriefDateGroupSection
                key={groupId}
                groupId={groupId}
                tasks={dateGrouped[groupId]}
                armedDeleteId={armedDeleteId}
                expandedTreeKeys={expandedTreeKeys}
                onToggleTreeExpand={toggleTreeExpand}
                onArmDelete={setArmedDeleteId}
                onDelete={deleteBrief}
                onDuplicate={duplicateBrief}
                onUpdate={updateBrief}
                onUpdateSubtask={updateSubtaskAtPath}
                onAddSubtask={addSubtaskAtPath}
                onAdd={addDesignBriefForGroup}
                onOpenTask={openBrief}
              />
            ))}
          </div>
        ) : null}

        {activeTab === 'by-status' ? (
          <div className={styles['db-table']}>
            {statusGroups.map((group) => (
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
                onDuplicate={duplicateBrief}
                onUpdate={updateBrief}
                onUpdateSubtask={updateSubtaskAtPath}
                onAddSubtask={addSubtaskAtPath}
                onAdd={addDesignBriefForStatus}
                onOpenTask={openBrief}
                listVariant="personal"
              />
            ))}
          </div>
        ) : null}

        {activeTab === 'by-people' ? (
          <div className={styles['db-table']}>
            {peopleGroups.map((group) => (
              <DesignBriefPeopleGroupSection
                key={group.memberId}
                memberId={group.memberId}
                label={group.label}
                tasks={group.tasks}
                armedDeleteId={armedDeleteId}
                expandedTreeKeys={expandedTreeKeys}
                onToggleTreeExpand={toggleTreeExpand}
                onArmDelete={setArmedDeleteId}
                onDelete={deleteBrief}
                onDuplicate={duplicateBrief}
                onUpdate={updateBrief}
                onUpdateSubtask={updateSubtaskAtPath}
                onAddSubtask={addSubtaskAtPath}
                onAdd={addDesignBriefForMember}
                onOpenTask={openBrief}
              />
            ))}
          </div>
        ) : null}

        {activeTab === 'archive' ? (
          hasAnyArchive ? (
            <div className={styles['db-table']}>
              {ARCHIVE_GROUP_ORDER.map((groupId) => (
                <DesignBriefArchiveGroupSection
                  key={groupId}
                  groupId={groupId}
                  tasks={archiveGrouped[groupId]}
                  armedDeleteId={armedDeleteId}
                  expandedTreeKeys={expandedTreeKeys}
                  onToggleTreeExpand={toggleTreeExpand}
                  onArmDelete={setArmedDeleteId}
                  onDelete={deleteBrief}
                onDuplicate={duplicateBrief}
                  onUpdate={updateBrief}
                  onUpdateSubtask={updateSubtaskAtPath}
                  onAddSubtask={addSubtaskAtPath}
                  onOpenTask={openBrief}
                />
              ))}
            </div>
          ) : (
            <p className={styles['db-empty-state']}>Архів порожній. Завершені ТЗ зʼявляться тут.</p>
          )
        ) : null}
      </div>
    </div>
  );
}
