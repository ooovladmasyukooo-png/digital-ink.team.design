import type { ReactNode } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../designBrief.module.css';
import type { DesignBriefViewTabId } from '../types';
import { DesignBriefSortSwitcher } from './DesignBriefSortSwitcher';
import { DesignBriefViewerSwitcher } from './DesignBriefViewerSwitcher';
import type { DesignBriefSortField } from '../designBriefSort';

const DESIGN_BRIEF_TABS: { id: DesignBriefViewTabId; label: string; icon: ReactNode }[] = [
  { id: 'by-date', label: 'За датами', icon: Icons.calendar },
  { id: 'by-status', label: 'По статусах', icon: Icons.filter },
  { id: 'by-people', label: 'По людях', icon: Icons.team },
  { id: 'archive', label: 'Архів', icon: Icons.inbox },
];

interface DesignBriefTabsBarProps {
  activeTab: DesignBriefViewTabId;
  onTab: (tabId: DesignBriefViewTabId) => void;
  viewerId: string;
  onViewerChange: (memberId: string) => void;
  sortField: DesignBriefSortField;
  onSortChange: (field: DesignBriefSortField) => void;
}

export function DesignBriefTabsBar({
  activeTab,
  onTab,
  viewerId,
  onViewerChange,
  sortField,
  onSortChange,
}: DesignBriefTabsBarProps) {
  return (
    <div className={styles['db-stacked-tabs-bar']}>
      <nav className={styles['db-stacked-tabs']} aria-label="Вкладки ТЗ">
        {DESIGN_BRIEF_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cx(styles['db-tab'], activeTab === tab.id && styles.on)}
            onClick={() => onTab(tab.id)}
          >
            <span className={styles['db-tab-i']}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      {activeTab !== 'archive' ? (
        <DesignBriefSortSwitcher sortField={sortField} onSortChange={onSortChange} />
      ) : null}
      <DesignBriefViewerSwitcher viewerId={viewerId} onViewerChange={onViewerChange} />
    </div>
  );
}
