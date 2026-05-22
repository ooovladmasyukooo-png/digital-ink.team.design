import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { ARCHIVE_GROUP_LABELS } from '../designBriefArchiveGroups';
import styles from '../designBrief.module.css';
import type { ArchiveGroupId } from '../../tasks/types';
import type { DesignBrief, DesignBriefPatch, DesignBriefSubtask } from '../types';
import { DesignBriefColumnsHeader } from './DesignBriefColumnsHeader';
import { DesignBriefListTree } from './DesignBriefListTree';

interface DesignBriefArchiveGroupSectionProps {
  groupId: ArchiveGroupId;
  tasks: DesignBrief[];
  armedDeleteId: string | null;
  expandedTreeKeys: ReadonlySet<string>;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, patch: DesignBriefPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: DesignBriefPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: DesignBriefSubtask) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
}

export function DesignBriefArchiveGroupSection({
  groupId,
  tasks,
  armedDeleteId,
  expandedTreeKeys,
  onToggleTreeExpand,
  onArmDelete,
  onDelete,
  onDuplicate,
  onUpdate,
  onUpdateSubtask,
  onAddSubtask,
  onOpenTask,
}: DesignBriefArchiveGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(groupId !== 'today' && groupId !== 'yesterday');

  if (tasks.length === 0) return null;

  return (
    <section className={cx(styles['db-group'], styles['db-group-archive'])} aria-label={ARCHIVE_GROUP_LABELS[groupId]}>
      <div className={styles['db-group-head']}>
        <button
          type="button"
          className={styles['db-group-toggle']}
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          <span className={cx(styles['db-chev'], collapsed && styles['db-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['db-group-title']}>{ARCHIVE_GROUP_LABELS[groupId]}</span>
        </button>
        <span className={styles['db-group-count']}>{tasks.length}</span>
      </div>

      {!collapsed ? (
        <>
          <DesignBriefColumnsHeader inGroup variant="archive" />
          <div className={styles['db-rows']}>
            {tasks.map((brief) => (
              <DesignBriefListTree
                key={brief.id}
                brief={brief}
                listVariant="archive"
                expandedKeys={expandedTreeKeys}
                onToggleExpand={onToggleTreeExpand}
                armedDeleteId={armedDeleteId}
                onArmDelete={onArmDelete}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onUpdateRoot={onUpdate}
                onUpdateSubtask={onUpdateSubtask}
                onAddSubtask={onAddSubtask}
                onOpen={onOpenTask}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
