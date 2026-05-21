import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../designBrief.module.css';

const VIEWPORT_MARGIN = 8;
const POP_GAP = 6;

function computePopPosition(anchor: HTMLElement, pop: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let pw = pop.offsetWidth;
  let ph = pop.offsetHeight;
  if (pw < 48) pw = 220;
  if (ph < 48) ph = 200;

  let top = rect.bottom + POP_GAP;
  const fitsBelow = top + ph <= window.innerHeight - VIEWPORT_MARGIN;
  if (!fitsBelow) {
    const aboveTop = rect.top - POP_GAP - ph;
    if (aboveTop >= VIEWPORT_MARGIN) top = aboveTop;
  }

  let left = rect.left;
  if (left + pw > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - pw;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  const maxH = window.innerHeight - VIEWPORT_MARGIN * 2;
  return {
    position: 'fixed',
    top,
    left,
    zIndex: 320,
    maxHeight: Math.min(ph, maxH),
  };
}

export interface TaskPickerItem {
  id: string;
  label: ReactNode;
  searchText?: string;
  selected?: boolean;
}

export interface TaskPickerClearOption {
  id: string;
  label: ReactNode;
  selected?: boolean;
}

interface DesignBriefPickerPopoverProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  items: TaskPickerItem[];
  width?: number;
  searchable?: boolean;
  clearOption?: TaskPickerClearOption;
  compact?: boolean;
  /** Не закривати після вибору (кілька значень). */
  multiSelect?: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  children?: ReactNode;
}

export function DesignBriefPickerPopover({
  open,
  anchorRef,
  items,
  width = 240,
  searchable,
  clearOption,
  compact,
  multiSelect,
  onClose,
  onSelect,
  children,
}: DesignBriefPickerPopoverProps) {
  const popRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [query, setQuery] = useState('');

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    setStyle(computePopPosition(anchor, pop));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition, items.length, clearOption?.id]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, onClose, reposition, anchorRef]);

  const filtered = searchable
    ? items.filter((item) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (item.searchText ?? '').toLowerCase().includes(q);
      })
    : items;

  const pick = (id: string) => {
    onSelect(id);
    if (!multiSelect) onClose();
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={popRef}
      className={styles['db-picker']}
      style={{ ...style, width, right: 'auto' }}
      role="listbox"
    >
      {searchable ? (
        <div className={styles['db-picker-search']}>
          <div className={styles['db-picker-search-in']}>
            <span className={styles['db-picker-search-i']}>{Icons.search}</span>
            <input
              type="search"
              placeholder="Пошук…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      ) : null}
      {children}
      <div className={cx(styles['db-picker-list'], compact && styles['db-picker-list-compact'])}>
        {filtered.length === 0 ? (
          <div className={styles['db-picker-empty']}>Нічого не знайдено</div>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={item.selected}
              className={cx(styles['db-picker-item'], item.selected && styles['db-picker-item-on'])}
              onClick={() => pick(item.id)}
            >
              <span className={styles['db-picker-item-body']}>{item.label}</span>
              {item.selected ? (
                <span className={styles['db-picker-check']} aria-hidden>
                  {Icons.check}
                </span>
              ) : null}
            </button>
          ))
        )}
      </div>
      {clearOption ? (
        <div className={styles['db-picker-foot']}>
          <button
            type="button"
            className={cx(styles['db-picker-clear'], clearOption.selected && styles['db-picker-clear-on'])}
            onClick={() => pick(clearOption.id)}
          >
            {clearOption.label}
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
