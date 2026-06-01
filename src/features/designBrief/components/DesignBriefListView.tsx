import { useMemo } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { ARCHIVE_GROUP_ORDER, groupDesignBriefArchive } from '../designBriefArchiveGroups';
import { DATE_GROUP_ORDER, groupDesignBriefsByDate } from '../designBriefDateGroups';
import { buildDesignBriefGroups } from '../designBriefGroups';
import { buildDesignBriefPeopleGroups } from '../designBriefPeopleGroups';
import type { DesignBriefWorkspace } from '../useDesignBriefWorkspace';
import styles from '../designBrief.module.css';
import type { DesignBriefSortField } from '../designBriefSort';
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
  sortField: DesignBriefSortField;
  onSortChange: (field: DesignBriefSortField) => void;
  onCreate: () => void;
  /** У вкладці проєкту — без дубльованого заголовка, без колонки «Проєкт». */
  embeddedInProject?: boolean;
  emptyStateLabel?: string;
}

export function DesignBriefListView({
  workspace,
  activeTab,
  onTab,
  viewerId,
  onViewerChange,
  sortField,
  onSortChange,
  onCreate,
  embeddedInProject = false,
  emptyStateLabel = 'Немає ТЗ для цього проєкту.',
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
    () => buildDesignBriefGroups(briefs, viewerId, sortField),
    [briefs, sortField, viewerId],
  );

  const dateGrouped = useMemo(
    () => groupDesignBriefsByDate(briefs, new Date(), viewerId, sortField),
    [briefs, sortField, viewerId],
  );

  const peopleGroups = useMemo(
    () => buildDesignBriefPeopleGroups(briefs, viewerId, sortField),
    [briefs, sortField, viewerId],
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
    (activeTab === 'by-status' || embeddedInProject) && styles['db-personal'],
    activeTab === 'archive' && styles['db-archive'],
    embeddedInProject && styles['db-project-embed'],
  );

  const dateListVariant = embeddedInProject ? 'personal' : 'default';

  return (
    <div className={styles['db-design-brief-shell']}>
      <header className={styles['db-stacked-header']}>
        {embeddedInProject ? (
          <div className={styles['db-project-embed-bar']}>
            <span className={styles['db-project-embed-count']}>{totalCount} ТЗ</span>
            <button className="red-out-btn" type="button" onClick={onCreate}>
              {Icons.plus} Нове ТЗ
            </button>
          </div>
        ) : (
          <DesignBriefListHeader count={totalCount} onCreate={onCreate} />
        )}
        <DesignBriefTabsBar
          activeTab={activeTab}
          onTab={onTab}
          viewerId={viewerId}
          onViewerChange={onViewerChange}
          sortField={sortField}
          onSortChange={onSortChange}
        />
      </header>
      <div className={listClassName}>
        {totalCount === 0 && activeTab !== 'archive' ? (
          <p className={styles['db-empty-state']}>{emptyStateLabel}</p>
        ) : null}

        {activeTab === 'by-date' && totalCount > 0 ? (
          <div className={styles['db-table']}>
            {DATE_GROUP_ORDER.map((groupId) => (
              <DesignBriefDateGroupSection
                key={groupId}
                groupId={groupId}
                listVariant={dateListVariant}
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

        {activeTab === 'by-status' && totalCount > 0 ? (
          <div className={styles['db-table']}>
            {statusGroups.map((group) => (
              <DesignBriefStatusGroupSection
                key={group.status}
                status={group.status}
                label={group.label}
                listVariant="personal"
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
              />
            ))}
          </div>
        ) : null}

        {activeTab === 'by-people' && totalCount > 0 ? (
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
