import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { ARCHIVE_GROUP_LABELS } from '../archiveGroups';
import styles from '../tasks.module.css';
import type { ArchiveGroupId, ArchiveListItem } from '../types';
import type { TasksWorkspace } from '../useTasksWorkspace';
import { ArchiveListRow } from './ArchiveListRow';
import { TaskColumnsHeader } from './TaskColumnsHeader';

interface ArchiveGroupSectionProps {
  groupId: ArchiveGroupId;
  items: ArchiveListItem[];
  workspace: TasksWorkspace;
}

export function ArchiveGroupSection({ groupId, items, workspace }: ArchiveGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(groupId === 'month' || groupId === 'earlier');

  if (items.length === 0) return null;

  return (
    <section className={cx(styles['ts-group'], styles['ts-group-near'], styles['ts-group-archive'])} aria-label={ARCHIVE_GROUP_LABELS[groupId]}>
      <div className={styles['ts-group-head']}>
        <button
          type="button"
          className={styles['ts-group-toggle']}
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          <span className={cx(styles['ts-chev'], collapsed && styles['ts-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['ts-group-title']}>{ARCHIVE_GROUP_LABELS[groupId]}</span>
        </button>
        <span className={styles['ts-group-count']}>{items.length}</span>
      </div>

      {!collapsed ? (
        <>
          <TaskColumnsHeader inGroup variant="archive" />
          <div className={styles['ts-rows']}>
            {items.map((item) => (
              <ArchiveListRow key={item.rowKey} item={item} workspace={workspace} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
