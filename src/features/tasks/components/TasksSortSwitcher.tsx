import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import {
  TASKS_SORT_LABELS,
  TASKS_SORT_OPTIONS,
  TASKS_SORT_SHORT,
} from '../taskSort';
import type { TasksSortField } from '../types';
import styles from '../tasks.module.css';

const MENU_WIDTH = 200;
const VIEWPORT_MARGIN = 10;
const MENU_GAP = 6;

const SORT_ICONS: Record<TasksSortField, ReactNode> = {
  deadline: Icons.calendar,
  status: Icons.sun,
  priority: Icons.flag,
};

function computeMenuStyle(anchor: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let left = rect.left;
  if (left + MENU_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - MENU_WIDTH;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  const spaceBelow = window.innerHeight - VIEWPORT_MARGIN - rect.bottom - MENU_GAP;
  const spaceAbove = rect.top - VIEWPORT_MARGIN - MENU_GAP;
  const openBelow = spaceBelow >= spaceAbove;

  if (openBelow) {
    return {
      position: 'fixed',
      top: rect.bottom + MENU_GAP,
      left,
      width: MENU_WIDTH,
      zIndex: 320,
    };
  }

  return {
    position: 'fixed',
    bottom: window.innerHeight - rect.top + MENU_GAP,
    left,
    width: MENU_WIDTH,
    zIndex: 320,
  };
}

interface TasksSortSwitcherProps {
  sortField: TasksSortField;
  onSortChange: (field: TasksSortField) => void;
}

export function TasksSortSwitcher({ sortField, onSortChange }: TasksSortSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    const anchor = triggerRef.current;
    if (!anchor) return;
    setMenuStyle(computeMenuStyle(anchor));
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition, sortField]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
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
  }, [open, reposition]);

  const menu =
    open &&
    createPortal(
      <div
        ref={menuRef}
        className={styles['ts-sort-menu']}
        style={menuStyle}
        role="menu"
        aria-label="Порядок задач"
      >
        <div className={styles['ts-picker-list']}>
          {TASKS_SORT_OPTIONS.map((id) => {
            const selected = sortField === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                aria-selected={selected}
                className={cx(styles['ts-picker-item'], selected && styles['ts-picker-item-on'])}
                onClick={() => {
                  onSortChange(id);
                  setOpen(false);
                }}
              >
                <span className={styles['ts-picker-item-body']}>
                  <span className={styles['ts-sort-picker-i']}>{SORT_ICONS[id]}</span>
                  <span>{TASKS_SORT_LABELS[id]}</span>
                </span>
                {selected ? (
                  <span className={styles['ts-picker-check']} aria-hidden>
                    {Icons.check}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>,
      document.body,
    );

  return (
    <div className={styles['ts-sort-wrap']}>
      <button
        ref={triggerRef}
        type="button"
        className={cx(styles['ts-sort'], open && styles.on)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Порядок: ${TASKS_SORT_LABELS[sortField]}`}
        title={TASKS_SORT_LABELS[sortField]}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles['ts-sort-i']} aria-hidden>
          {SORT_ICONS[sortField]}
        </span>
        <span className={styles['ts-sort-label']}>{TASKS_SORT_SHORT[sortField]}</span>
        <span className={styles['ts-sort-chev']} aria-hidden>
          {Icons.chevD}
        </span>
      </button>
      {menu}
    </div>
  );
}
