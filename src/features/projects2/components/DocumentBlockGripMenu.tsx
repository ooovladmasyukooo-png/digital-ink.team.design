import { createPortal } from 'react-dom';
import styles from '../projects2.module.css';

interface DocumentBlockGripMenuProps {
  top: number;
  left: number;
  onSelect: () => void;
  onDelete: () => void;
}

export function DocumentBlockGripMenu({ top, left, onSelect, onDelete }: DocumentBlockGripMenuProps) {
  return createPortal(
    <div
      className={styles['p2-doc-grip-menu']}
      style={{ top: top + 4, left }}
      role="menu"
      aria-label="Дії з блоком"
      onMouseDown={(e) => e.preventDefault()}
    >
      <button type="button" role="menuitem" className={styles['p2-doc-grip-menu-item']} onClick={onSelect}>
        Вибрати
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
