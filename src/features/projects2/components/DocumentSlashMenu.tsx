import { type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../../shared/styles/cx';
import type { SlashBlock } from '../documents/slashBlocks';
import { SlashBlockIcon } from './SlashBlockIcon';
import styles from '../projects2.module.css';

interface DocumentSlashMenuProps {
  style: CSSProperties;
  hint: string;
  options: SlashBlock[];
  activeIndex: number;
  onPick: (block: SlashBlock) => void;
  onHover: (index: number) => void;
  menuRef?: RefObject<HTMLDivElement | null>;
}

export function DocumentSlashMenu({
  style,
  hint,
  options,
  activeIndex,
  onPick,
  onHover,
  menuRef,
}: DocumentSlashMenuProps) {
  return createPortal(
    <div
      ref={menuRef}
      className={styles['p2-doc-slash-menu']}
      style={style}
      role="listbox"
      aria-label="Тип блоку"
    >
      <div className={styles['p2-doc-slash-hint']}>{hint}</div>
      {options.map((item, optionIndex) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={optionIndex === activeIndex}
          className={cx(styles['p2-doc-slash-item'], optionIndex === activeIndex && styles['p2-doc-slash-item-on'])}
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => onHover(optionIndex)}
          onClick={() => onPick(item)}
        >
          <SlashBlockIcon blockId={item.id} />
          <span className={styles['p2-doc-slash-item-body']}>
            <span className={styles['p2-doc-slash-label']}>{item.label}</span>
            <span className={styles['p2-doc-slash-sub']}>{item.hint}</span>
          </span>
        </button>
      ))}
    </div>,
    document.body,
  );
}
