import { createPortal } from 'react-dom';
import { cx } from '../../../shared/styles/cx';
import type { InlineFormatKind } from '../documents/inlineFormat';
import styles from '../projects2.module.css';

interface DocumentBlockFormatBarProps {
  top: number;
  left: number;
  onFormat: (kind: InlineFormatKind) => void;
}

const BUTTONS: { kind: InlineFormatKind; label: string; title: string; className?: string }[] = [
  { kind: 'bold', label: 'B', title: 'Жирний (⌘B)', className: styles['p2-doc-format-bold'] },
  { kind: 'italic', label: 'I', title: 'Курсив (⌘I)', className: styles['p2-doc-format-italic'] },
  { kind: 'strike', label: 'S', title: 'Закреслений', className: styles['p2-doc-format-strike'] },
  { kind: 'code', label: '</>', title: 'Код', className: styles['p2-doc-format-code'] },
];

export function DocumentBlockFormatBar({ top, left, onFormat }: DocumentBlockFormatBarProps) {
  return createPortal(
    <div
      className={styles['p2-doc-format-bar']}
      style={{ top: Math.max(8, top), left: Math.max(8, left) }}
      role="toolbar"
      aria-label="Форматування тексту"
      onMouseDown={(e) => e.preventDefault()}
    >
      {BUTTONS.map((btn) => (
        <button
          key={btn.kind}
          type="button"
          className={cx(styles['p2-doc-format-btn'], btn.className)}
          title={btn.title}
          onClick={() => onFormat(btn.kind)}
        >
          {btn.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
