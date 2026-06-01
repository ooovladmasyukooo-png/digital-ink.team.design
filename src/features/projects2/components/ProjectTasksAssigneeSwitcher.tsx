import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { TASK_CREATOR_ASSIGNEE_ID } from '../../tasks/constants';
import { teamById } from '../../tasks/taskOptions';
import styles from '../../tasks/tasks.module.css';

const MENU_WIDTH = 200;
const VIEWPORT_MARGIN = 10;
const MENU_GAP = 6;
const HOVER_CLOSE_MS = 160;

function computeMenuStyle(anchor: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let left = rect.right - MENU_WIDTH;
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
  if (left + MENU_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - MENU_WIDTH;
  }

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

interface ProjectTasksAssigneeSwitcherProps {
  assigneeIds: string[];
  activeAssigneeId: string | null;
  onChange: (assigneeId: string | null) => void;
}

export function ProjectTasksAssigneeSwitcher({
  assigneeIds,
  activeAssigneeId,
  onChange,
}: ProjectTasksAssigneeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAll = activeAssigneeId === null;
  const isSelf = activeAssigneeId === TASK_CREATOR_ASSIGNEE_ID;
  const activeMember = activeAssigneeId ? teamById[activeAssigneeId] : null;
  const showClear = !isAll;

  const menuMemberIds = useMemo(() => {
    const ids = new Set(assigneeIds);
    ids.add(TASK_CREATOR_ASSIGNEE_ID);
    return [...ids].sort((a, b) => a.localeCompare(b));
  }, [assigneeIds]);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  }, [cancelClose]);

  const openMenu = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const resetToAll = () => {
    onChange(null);
    setOpen(false);
  };

  const syncMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    setMenuStyle(computeMenuStyle(triggerRef.current));
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    syncMenuPosition();
    window.addEventListener('resize', syncMenuPosition);
    window.addEventListener('scroll', syncMenuPosition, true);
    return () => {
      window.removeEventListener('resize', syncMenuPosition);
      window.removeEventListener('scroll', syncMenuPosition, true);
    };
  }, [open, syncMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  const menu =
    open &&
    createPortal(
      <div
        ref={menuRef}
        className={cx('pop', 'pop-tab-menu', styles['ts-viewer-menu'], styles['ts-project-assignee-menu'])}
        style={menuStyle}
        role="menu"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <div className={cx('pop-tab-list', styles['ts-viewer-list'])}>
          <button
            type="button"
            role="menuitem"
            className={cx('pop-row', styles['ts-viewer-row'], isAll && 'on')}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            <span className={cx('pop-row-i', styles['ts-viewer-all-i'])}>{Icons.team}</span>
            <span className="pop-row-t">Усі</span>
          </button>
          {menuMemberIds.map((id) => {
            const member = teamById[id];
            if (!member) return null;
            const itemSelf = id === TASK_CREATOR_ASSIGNEE_ID;
            const selected = activeAssigneeId === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                className={cx('pop-row', styles['ts-viewer-row'], selected && 'on')}
                onClick={() => {
                  onChange(id);
                  setOpen(false);
                }}
              >
                <span className="pop-row-i">
                  <Avatar name={member.name} hue={member.hue} size="sm" />
                </span>
                <span className="pop-row-t">
                  {itemSelf ? 'Мій' : member.name}
                  {itemSelf ? <span className={styles['ts-viewer-row-tag']}>я</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>,
      document.body,
    );

  const triggerLabel = isAll
    ? 'Усі'
    : isSelf
      ? 'Мій'
      : (activeMember?.name.split(' ')[0] ?? 'Усі');

  return (
    <div
      ref={wrapRef}
      className={styles['ts-viewer-wrap']}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <div className={cx(styles['ts-viewer-cluster'], showClear && styles['ts-viewer-cluster-filtered'])}>
        <button
          ref={triggerRef}
          type="button"
          className={cx(
            styles['ts-viewer'],
            open && styles.on,
            isAll && styles['ts-viewer-all-on'],
            showClear && styles['ts-viewer-with-clear'],
            showClear && styles['ts-viewer-other'],
          )}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={
            isAll
              ? 'Усі відповідальні'
              : isSelf
                ? 'Мої задачі проєкту'
                : `Відповідальний: ${activeMember?.name ?? ''}`
          }
          onClick={() => setOpen((v) => !v)}
        >
          {isAll ? (
            <span className={styles['ts-viewer-all-i']}>{Icons.team}</span>
          ) : activeMember ? (
            <Avatar name={activeMember.name} hue={activeMember.hue} size="sm" />
          ) : (
            <span className={styles['ts-viewer-all-i']}>{Icons.team}</span>
          )}
          <span className={styles['ts-viewer-label']} title={triggerLabel}>
            {triggerLabel}
          </span>
          <span className={styles['ts-viewer-chev']} aria-hidden>
            {Icons.chevD}
          </span>
        </button>
        {showClear ? (
          <button
            type="button"
            className={styles['ts-viewer-clear']}
            aria-label="Показати задачі всіх відповідальних"
            onClick={resetToAll}
          >
            {Icons.close}
          </button>
        ) : null}
      </div>
      {menu}
    </div>
  );
}
