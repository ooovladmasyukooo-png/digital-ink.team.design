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
import styles from '../tasks.module.css';

const VIEWPORT_MARGIN = 8;
const POP_GAP = 6;

function computePopPosition(anchor: HTMLElement, pop: HTMLElement, align: 'start' | 'center'): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let pw = pop.offsetWidth;
  let ph = pop.offsetHeight;
  if (pw < 48) pw = 200;
  if (ph < 48) ph = 120;

  let top = rect.bottom + POP_GAP;
  if (top + ph > window.innerHeight - VIEWPORT_MARGIN) {
    const above = rect.top - POP_GAP - ph;
    if (above >= VIEWPORT_MARGIN) top = above;
  }
  if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;

  let left = align === 'center' ? rect.left + rect.width / 2 - pw / 2 : rect.left;
  const maxW = window.innerWidth - 2 * VIEWPORT_MARGIN;
  if (pw > maxW) pw = maxW;
  if (left + pw > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - pw;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  const style: CSSProperties = { top, left, minWidth: Math.min(pw, 240) };
  const maxH = window.innerHeight - VIEWPORT_MARGIN - top;
  if (ph > maxH - 1) {
    style.maxHeight = Math.max(120, maxH);
    style.overflowY = 'auto';
  }
  return style;
}

interface CellPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  label: string;
  align?: 'start' | 'center';
  triggerClassName?: string;
}

export function CellPopover({
  open,
  onOpenChange,
  trigger,
  children,
  label,
  align = 'start',
  triggerClassName,
}: CellPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [popStyle, setPopStyle] = useState<CSSProperties>({});

  const reposition = useCallback(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    setPopStyle(computePopPosition(anchor, pop, align));
  }, [open, align]);

  useLayoutEffect(() => {
    if (!open) {
      setPopStyle({});
      return;
    }
    reposition();
    const id = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(id);
  }, [open, reposition, children]);

  useEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || popRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onOpenChange]);

  return (
    <div className={styles['cell-pop-root']} ref={rootRef}>
      <button
        ref={anchorRef}
        type="button"
        className={triggerClassName ?? styles['cell-pop-trigger']}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
      >
        {trigger}
      </button>
      {open
        ? createPortal(
            <div ref={popRef} className={styles['cell-pop']} style={popStyle} role="dialog" aria-label={label}>
              {children}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
