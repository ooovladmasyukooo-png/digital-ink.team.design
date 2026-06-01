import { createPortal } from 'react-dom';
import styles from '../projects2.module.css';

interface DocumentTreeGripMenuProps {
  top: number;
  left: number;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function DocumentTreeGripMenu({ top, left, onDuplicate, onDelete }: DocumentTreeGripMenuProps) {
  return createPortal(
    <div
      className={styles['p2-doc-grip-menu']}
      style={{ top: top + 4, left }}
      role="menu"
      aria-label="Дії з елементом дерева"
      onMouseDown={(e) => e.preventDefault()}
    >
      <button type="button" role="menuitem" className={styles['p2-doc-grip-menu-item']} onClick={onDuplicate}>
        Дублювати
      </button>
      <button
        type="button"
        role="menuitem"
        className={styles['p2-doc-grip-menu-item']}
        data-variant="danger"
        onClick={onDelete}
      >
        Видалити
      </button>
    </div>,
    document.body,
  );
}
