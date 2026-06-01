import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import type { DateGroupId } from '../../tasks/types';
import { DATE_GROUP_LABELS } from '../designBriefDateGroups';
import styles from '../designBrief.module.css';
import type { DesignBrief, DesignBriefPatch, DesignBriefSubtask } from '../types';
import { DesignBriefColumnsHeader } from './DesignBriefColumnsHeader';
import { DesignBriefListTree } from './DesignBriefListTree';

interface DesignBriefDateGroupSectionProps {
  groupId: DateGroupId;
  listVariant?: 'default' | 'personal' | 'withCompleted';
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
  onAdd: (groupId: DateGroupId) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
}

export function DesignBriefDateGroupSection({
  groupId,
  listVariant = 'default',
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
  onAdd,
  onOpenTask,
}: DesignBriefDateGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(
    groupId === 'week' || groupId === 'later' || groupId === 'none',
  );

  if (tasks.length === 0) return null;

  const isNearGroup = groupId === 'overdue' || groupId === 'today' || groupId === 'tomorrow';
  const isOverdueGroup = groupId === 'overdue';

  return (
    <section
      className={cx(
        styles['db-group'],
        isNearGroup && styles['db-group-near'],
        isOverdueGroup && styles['db-group-overdue'],
      )}
      aria-label={DATE_GROUP_LABELS[groupId]}
    >
      <div className={styles['db-group-head']}>
        <button
          type="button"
          className={styles['db-group-toggle']}
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          <span className={cx(styles['db-chev'], collapsed && styles['db-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['db-group-title']}>{DATE_GROUP_LABELS[groupId]}</span>
        </button>
        <span className={styles['db-group-count']}>{tasks.length}</span>
        <button
          type="button"
          className={styles['db-group-add']}
          aria-label={`Нове ТЗ: ${DATE_GROUP_LABELS[groupId]}`}
          onClick={() => onAdd(groupId)}
        >
          {Icons.plus}
        </button>
      </div>

      {!collapsed ? (
        <>
          <DesignBriefColumnsHeader inGroup variant={listVariant === 'personal' ? 'personal' : 'default'} />
          <div className={styles['db-rows']}>
            {tasks.map((brief) => (
              <DesignBriefListTree
                key={brief.id}
                brief={brief}
                listVariant={listVariant}
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
          <button type="button" className={styles['db-new-row']} onClick={() => onAdd(groupId)}>
            {Icons.plus}
            <span>Нове ТЗ</span>
          </button>
        </>
      ) : null}
    </section>
  );
}
