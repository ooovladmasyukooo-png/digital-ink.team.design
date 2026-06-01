import { useEffect } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects2.module.css';

const ARM_MS = 5000;

interface DocumentDeleteButtonProps {
  armed: boolean;
  onArm: (armed: boolean) => void;
  onDelete: () => void;
  itemLabel?: 'page' | 'folder';
}

export function DocumentDeleteButton({
  armed,
  onArm,
  onDelete,
  itemLabel = 'page',
}: DocumentDeleteButtonProps) {
  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => onArm(false), ARM_MS);
    return () => window.clearTimeout(t);
  }, [armed, onArm]);

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (armed) {
      onDelete();
      onArm(false);
    } else {
      onArm(true);
    }
  };

  return (
    <button
      type="button"
      className={cx(styles['p2-doc-del'], armed && styles['p2-doc-del-armed'])}
      aria-label={
        armed
          ? 'Підтвердити видалення'
          : itemLabel === 'folder'
            ? 'Видалити папку (натисніть ще раз)'
            : 'Видалити сторінку (натисніть ще раз)'
      }
      title={armed ? 'Підтвердити видалення' : 'Натисніть двічі для видалення'}
      onClick={handleClick}
    >
      {Icons.trash}
    </button>
  );
}
