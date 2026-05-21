import { useEffect, useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { STATUS_META } from '../constants';
import styles from '../designBrief.module.css';
import type { Status, DesignBrief, DesignBriefPatch, DesignBriefSubtask } from '../types';
import { DesignBriefColumnsHeader } from './DesignBriefColumnsHeader';
import { DesignBriefListTree } from './DesignBriefListTree';

interface DesignBriefStatusGroupSectionProps {
  status: Status;
  label: string;
  tasks: DesignBrief[];
  /** Особисті — без «Проєкт»; withCompleted — колонка «Викон.» */
  listVariant?: 'default' | 'personal' | 'withCompleted';
  armedDeleteId: string | null;
  expandedTreeKeys: ReadonlySet<string>;
  onToggleTreeExpand: (rootId: string, path: string[]) => void;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: DesignBriefPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: DesignBriefPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: DesignBriefSubtask) => void;
  onAdd: (status: Status) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
}

const STATUS_GROUP_CLASS: Record<string, string | undefined> = {
  slate: styles['db-group-status-slate'],
  gray: styles['db-group-status-gray'],
  blue: styles['db-group-status-blue'],
  purple: styles['db-group-status-purple'],
  green: styles['db-group-status-green'],
};

export function DesignBriefStatusGroupSection({
  status,
  label,
  tasks,
  armedDeleteId,
  expandedTreeKeys,
  onToggleTreeExpand,
  onArmDelete,
  onDelete,
  onUpdate,
  onUpdateSubtask,
  onAddSubtask,
  onAdd,
  onOpenTask,
  listVariant = 'default',
}: DesignBriefStatusGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(status === 'done' || tasks.length === 0);
  const prevTaskCount = useRef(tasks.length);

  useEffect(() => {
    if (tasks.length === 0) {
      setCollapsed(true);
    } else if (prevTaskCount.current === 0 && status !== 'done') {
      setCollapsed(false);
    }
    prevTaskCount.current = tasks.length;
  }, [tasks.length, status]);

  const handleAdd = () => {
    setCollapsed(false);
    onAdd(status);
  };

  const tone = STATUS_META[status].tone;
  const toneClass = STATUS_GROUP_CLASS[tone];
  const headerVariant =
    listVariant === 'personal' ? 'personal' : listVariant === 'withCompleted' ? 'withCompleted' : 'default';

  return (
    <section
      className={cx(
        styles['db-group'],
        styles['db-group-status'],
        toneClass,
        listVariant === 'withCompleted' && styles['db-group-with-completed'],
      )}
      aria-label={label}
    >
      <div className={styles['db-group-head']}>
        <button
          type="button"
          className={styles['db-group-toggle']}
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          <span className={cx(styles['db-chev'], collapsed && styles['db-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['db-group-title']}>{label}</span>
        </button>
        <span className={styles['db-group-count']}>{tasks.length}</span>
        <button
          type="button"
          className={styles['db-group-add']}
          aria-label={`Нове ТЗ: ${label}`}
          onClick={handleAdd}
        >
          {Icons.plus}
        </button>
      </div>

      {!collapsed ? (
        <>
          <DesignBriefColumnsHeader inGroup variant={headerVariant} />
          {tasks.length > 0 ? (
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
                  onUpdateRoot={onUpdate}
                  onUpdateSubtask={onUpdateSubtask}
                  onAddSubtask={onAddSubtask}
                  onOpen={onOpenTask}
                />
              ))}
            </div>
          ) : (
            <p className={styles['db-group-empty']}>Немає задач</p>
          )}

          <button type="button" className={styles['db-new-row']} onClick={handleAdd}>
            {Icons.plus}
            <span>Нове ТЗ</span>
          </button>
        </>
      ) : null}
    </section>
  );
}
