import { useEffect, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../designBrief.module.css';

const ARM_MS = 5000;

interface DesignBriefDeleteButtonProps {
  briefId: string;
  armedId: string | null;
  onArm: (id: string | null) => void;
  onDelete: (id: string) => void;
  itemLabel?: 'task' | 'subtask';
}

export function DesignBriefDeleteButton({
  briefId,
  armedId,
  onArm,
  onDelete,
  itemLabel = 'task',
}: DesignBriefDeleteButtonProps) {
  const armed = armedId === briefId;

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => onArm(null), ARM_MS);
    return () => window.clearTimeout(t);
  }, [armed, onArm]);

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (armed) {
      onDelete(briefId);
      onArm(null);
    } else {
      onArm(briefId);
    }
  };

  return (
    <button
      type="button"
      className={cx(styles['db-row-del'], armed && styles['db-row-del-armed'])}
      aria-label={
        armed
          ? 'Підтвердити видалення'
          : itemLabel === 'subtask'
            ? 'Видалити підзадачу'
            : 'Видалити задачу'
      }
      onClick={handleClick}
    >
      {Icons.trash}
    </button>
  );
}
