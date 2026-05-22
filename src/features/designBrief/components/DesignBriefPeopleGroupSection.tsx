import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { teamMembers } from '../../team/data';
import styles from '../designBrief.module.css';
import type { DesignBrief, DesignBriefPatch, DesignBriefSubtask } from '../types';
import { DesignBriefColumnsHeader } from './DesignBriefColumnsHeader';
import { DesignBriefListTree } from './DesignBriefListTree';

interface DesignBriefPeopleGroupSectionProps {
  memberId: string;
  label: string;
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
  onAdd: (memberId: string) => void;
  onOpenTask: (id: string, subtaskPath?: string[]) => void;
}

export function DesignBriefPeopleGroupSection({
  memberId,
  label,
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
}: DesignBriefPeopleGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(tasks.length === 0);
  const prevTaskCount = useRef(tasks.length);
  const member = teamMembers.find((item) => item.id === memberId);

  useEffect(() => {
    if (tasks.length === 0) {
      setCollapsed(true);
    } else if (prevTaskCount.current === 0) {
      setCollapsed(false);
    }
    prevTaskCount.current = tasks.length;
  }, [tasks.length]);

  const handleAdd = () => {
    setCollapsed(false);
    onAdd(memberId);
  };

  return (
    <section className={cx(styles['db-group'], styles['db-group-project'])} aria-label={label}>
      <div className={styles['db-group-head']}>
        <button
          type="button"
          className={styles['db-group-toggle']}
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
        >
          <span className={cx(styles['db-chev'], collapsed && styles['db-chev-closed'])}>{Icons.chevD}</span>
          <span className={styles['db-group-project-title']}>
            {member ? (
              <span className={styles['db-group-project-av']}>
                <Avatar name={member.name} hue={member.hue} size="sm" />
              </span>
            ) : null}
            <span className={styles['db-group-project-name']}>{label}</span>
          </span>
        </button>
        <span className={styles['db-group-count']}>{tasks.length}</span>
        <button type="button" className={styles['db-group-add']} aria-label={`Нове ТЗ: ${label}`} onClick={handleAdd}>
          {Icons.plus}
        </button>
      </div>

      {!collapsed ? (
        <>
          <DesignBriefColumnsHeader inGroup variant="personal" />
          {tasks.length > 0 ? (
            <div className={styles['db-rows']}>
              {tasks.map((brief) => (
                <DesignBriefListTree
                  key={brief.id}
                  brief={brief}
                  listVariant="personal"
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
          ) : (
            <p className={styles['db-group-empty']}>Немає ТЗ</p>
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
