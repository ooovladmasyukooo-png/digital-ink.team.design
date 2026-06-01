import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../../shared/styles/cx';
import {
  PipelineStatusChip,
  PROJECT_PIPELINE_STATUS_GROUPS,
  type ProjectPipelineStatus,
} from '../projectPipelineStatus';
import styles from '../projects2.module.css';

const VIEWPORT_MARGIN = 8;
const POP_GAP = 6;

function computePopPosition(anchor: HTMLElement, pop: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let pw = pop.offsetWidth;
  let ph = pop.offsetHeight;
  if (pw < 48) pw = 260;
  if (ph < 48) ph = 320;

  let top = rect.bottom + POP_GAP;
  const fitsBelow = top + ph <= window.innerHeight - VIEWPORT_MARGIN;
  if (!fitsBelow) {
    const aboveTop = rect.top - POP_GAP - ph;
    if (aboveTop >= VIEWPORT_MARGIN) top = aboveTop;
  }

  let left = rect.right - pw;
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

interface ProjectPipelineStatusPopoverProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  current: ProjectPipelineStatus;
  onClose: () => void;
  onSelect: (status: ProjectPipelineStatus) => void;
}

export function ProjectPipelineStatusPopover({
  open,
  anchorRef,
  current,
  onClose,
  onSelect,
}: ProjectPipelineStatusPopoverProps) {
  const popRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    setStyle(computePopPosition(anchor, pop));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
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

  if (!open) return null;

  return createPortal(
    <div
      ref={popRef}
      className={styles['p2-status-pop']}
      style={{ ...style, width: 260, right: 'auto' }}
      role="listbox"
      aria-label="Статус проєкту"
    >
      {PROJECT_PIPELINE_STATUS_GROUPS.map((group) => (
        <div key={group.label} className={styles['p2-status-pop-group']}>
          <div className={styles['p2-status-pop-group-t']}>{group.label}</div>
          {group.statuses.map((status) => {
            const id = status as ProjectPipelineStatus;
            const selected = id === current;
            return (
              <button
                key={status}
                type="button"
                role="option"
                aria-selected={selected}
                className={cx(
                  styles['p2-status-pop-opt'],
                  selected && styles['p2-status-pop-opt-on'],
                )}
                onClick={() => onSelect(id)}
              >
                <PipelineStatusChip status={id} />
              </button>
            );
          })}
        </div>
      ))}
    </div>,
    document.body,
  );
}
