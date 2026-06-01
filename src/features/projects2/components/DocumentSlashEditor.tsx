import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../../shared/styles/cx';
import {
  applySlashBlock,
  filterSlashBlocks,
  findSlashToken,
  type SlashBlock,
} from '../documents/slashBlocks';
import styles from '../projects2.module.css';

interface DocumentSlashEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DocumentSlashEditor({ value, onChange }: DocumentSlashEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [token, setToken] = useState<{ start: number; end: number; query: string } | null>(null);

  const options = filterSlashBlocks(query);

  const syncSlashMenu = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const found = findSlashToken(el.value, el.selectionStart);
    if (!found) {
      setOpen(false);
      setToken(null);
      setQuery('');
      return;
    }
    setToken(found);
    setQuery(found.query);
    setOpen(true);
    setActiveIndex(0);
  }, []);

  const repositionMenu = useCallback(() => {
    const el = textareaRef.current;
    if (!el || !open) return;
    const rect = el.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: Math.min(rect.top + 72, window.innerHeight - 280),
      left: Math.min(rect.left + 8, window.innerWidth - 260),
      width: 248,
      zIndex: 340,
    });
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    repositionMenu();
    window.addEventListener('resize', repositionMenu);
    window.addEventListener('scroll', repositionMenu, true);
    return () => {
      window.removeEventListener('resize', repositionMenu);
      window.removeEventListener('scroll', repositionMenu, true);
    };
  }, [open, repositionMenu, query]);

  useEffect(() => {
    if (activeIndex >= options.length) setActiveIndex(0);
  }, [activeIndex, options.length]);

  const pickBlock = useCallback(
    (block: SlashBlock) => {
      const el = textareaRef.current;
      if (!el || !token) return;
      const { next, cursor } = applySlashBlock(el.value, token, block.insert);
      onChange(next);
      setOpen(false);
      setToken(null);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(cursor, cursor);
      });
    },
    [onChange, token],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open || options.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + options.length) % options.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      pickBlock(options[activeIndex]!);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  const menu =
    open &&
    options.length > 0 &&
    createPortal(
      <div
        ref={menuRef}
        className={styles['p2-doc-slash-menu']}
        style={menuStyle}
        role="listbox"
        aria-label="Тип блоку"
      >
        <div className={styles['p2-doc-slash-hint']}>Введіть / для блоку</div>
        {options.map((block, index) => (
          <button
            key={block.id}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            className={cx(styles['p2-doc-slash-item'], index === activeIndex && styles['p2-doc-slash-item-on'])}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pickBlock(block)}
          >
            <span className={styles['p2-doc-slash-label']}>{block.label}</span>
            <span className={styles['p2-doc-slash-sub']}>{block.hint}</span>
          </button>
        ))}
      </div>,
      document.body,
    );

  return (
    <div className={styles['p2-doc-editor-area']}>
      <textarea
        ref={textareaRef}
        className={styles['p2-doc-body']}
        value={value}
        placeholder="Пишіть або введіть / для вибору типу блоку…"
        spellCheck
        onChange={(e) => {
          onChange(e.target.value);
          requestAnimationFrame(syncSlashMenu);
        }}
        onKeyDown={onKeyDown}
        onKeyUp={syncSlashMenu}
        onClick={syncSlashMenu}
      />
      {menu}
    </div>
  );
}
