import { useEffect, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../tasks.module.css';

const ARM_MS = 5000;

interface TaskDeleteButtonProps {
  taskId: string;
  armedId: string | null;
  onArm: (id: string | null) => void;
  onDelete: (id: string) => void;
  itemLabel?: 'task' | 'subtask';
}

export function TaskDeleteButton({
  taskId,
  armedId,
  onArm,
  onDelete,
  itemLabel = 'task',
}: TaskDeleteButtonProps) {
  const armed = armedId === taskId;

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => onArm(null), ARM_MS);
    return () => window.clearTimeout(t);
  }, [armed, onArm]);

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (armed) {
      onDelete(taskId);
      onArm(null);
    } else {
      onArm(taskId);
    }
  };

  return (
    <button
      type="button"
      className={cx(styles['ts-row-del'], armed && styles['ts-row-del-armed'])}
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
