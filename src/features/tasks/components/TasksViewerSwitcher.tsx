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
import { teamMembers } from '../../team/data';
import { TASK_CREATOR_ASSIGNEE_ID } from '../constants';
import styles from '../tasks.module.css';
import { TASKS_VIEWER_ALL_ID, isTasksViewerAll } from '../taskViewer';
import { groupViewerMembers, viewerRoleLabel } from '../viewerMemberGroups';

const VIEWER_MEMBERS = teamMembers.filter((m) => m.status === 'active');
const MENU_WIDTH = 236;
const VIEWPORT_MARGIN = 10;
const MENU_GAP = 6;
const MENU_MAX_VH = 0.82;

function computeMenuStyle(anchor: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let left = rect.right - MENU_WIDTH;
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
  if (left + MENU_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - MENU_WIDTH;
  }

  const cap = Math.floor(window.innerHeight * MENU_MAX_VH);
  const spaceBelow = window.innerHeight - VIEWPORT_MARGIN - rect.bottom - MENU_GAP;
  const spaceAbove = rect.top - VIEWPORT_MARGIN - MENU_GAP;
  const openBelow = spaceBelow >= spaceAbove;
  const maxHeight = Math.min(cap, Math.max(openBelow ? spaceBelow : spaceAbove, 200));

  if (openBelow) {
    return {
      position: 'fixed',
      top: rect.bottom + MENU_GAP,
      left,
      width: MENU_WIDTH,
      maxHeight,
      zIndex: 320,
      display: 'flex',
      flexDirection: 'column',
    };
  }

  return {
    position: 'fixed',
    bottom: window.innerHeight - rect.top + MENU_GAP,
    left,
    width: MENU_WIDTH,
    maxHeight,
    zIndex: 320,
    display: 'flex',
    flexDirection: 'column',
  };
}

interface TasksViewerSwitcherProps {
  viewerId: string;
  onViewerChange: (memberId: string) => void;
}

export function TasksViewerSwitcher({ viewerId, onViewerChange }: TasksViewerSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isAll = isTasksViewerAll(viewerId);
  const viewer =
    VIEWER_MEMBERS.find((m) => m.id === viewerId) ??
    teamMembers.find((m) => m.id === viewerId) ??
    VIEWER_MEMBERS[0];
  const isSelf = viewerId === TASK_CREATOR_ASSIGNEE_ID;
  const showClear = !isSelf && !isAll;

  const resetToSelf = () => {
    onViewerChange(TASK_CREATOR_ASSIGNEE_ID);
    setOpen(false);
  };

  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      VIEWER_MEMBERS.filter((item) => {
        if (!query) return true;
        const haystack = `${item.name} ${item.username} ${item.role}`.toLowerCase();
        return haystack.includes(query);
      }),
    [query],
  );

  const groups = useMemo(() => groupViewerMembers(filtered), [filtered]);
  const showAllOption = !query || 'усі'.includes(query) || 'всі'.includes(query);
  const hasList = showAllOption || groups.length > 0;

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
    if (!open) {
      setSearch('');
      return;
    }
    const id = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target) ||
        target.closest('[data-tasks-viewer-trigger]')
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const menu =
    open &&
    createPortal(
      <div
        ref={menuRef}
        className={cx('pop', 'pop-tab-menu', styles['ts-viewer-menu'])}
        style={menuStyle}
        role="menu"
      >
        <div className={cx('pop-tab-menu-search', styles['ts-viewer-search'])}>
          <label className="pop-tab-menu-search-in">
            <span className="pop-tab-menu-search-i">{Icons.search}</span>
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Пошук..."
              aria-label="Пошук спеціалістів"
            />
          </label>
        </div>
        <div className={cx('pop-tab-list', styles['ts-viewer-list'])}>
          {hasList ? (
            <>
              {showAllOption ? (
                <button
                  className={cx('pop-row', styles['ts-viewer-row'], isAll && 'on')}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    onViewerChange(TASKS_VIEWER_ALL_ID);
                    setOpen(false);
                  }}
                >
                  <span className={cx('pop-row-i', styles['ts-viewer-all-i'])}>{Icons.team}</span>
                  <span className="pop-row-t">Усі</span>
                </button>
              ) : null}
              {groups.map((group) => (
                <div key={group.role} className={styles['ts-viewer-group']}>
                  <div className={styles['ts-viewer-group-label']}>{viewerRoleLabel(group.role)}</div>
                  {group.members.map((item) => {
                    const itemSelf = item.id === TASK_CREATOR_ASSIGNEE_ID;
                    return (
                      <button
                        key={item.id}
                        className={cx('pop-row', styles['ts-viewer-row'], item.id === viewerId && 'on')}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          onViewerChange(item.id);
                          setOpen(false);
                        }}
                      >
                        <span className="pop-row-i">
                          <Avatar name={item.name} hue={item.hue} size="sm" />
                        </span>
                        <span className="pop-row-t">
                          {item.name}
                          {itemSelf ? (
                            <span className={styles['ts-viewer-row-tag']}>мій</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          ) : (
            <div className="pop-tab-empty">Нікого не знайдено</div>
          )}
        </div>
      </div>,
      document.body,
    );

  return (
    <div className={styles['ts-viewer-wrap']}>
      <div
        className={cx(styles['ts-viewer-cluster'], showClear && styles['ts-viewer-cluster-filtered'])}
      >
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
          data-tasks-viewer-trigger
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={
            isAll ? 'Усі задачі команди' : isSelf ? 'Мій режим задач' : `Перегляд задач: ${viewer.name}`
          }
          onClick={() => setOpen((v) => !v)}
        >
          {isAll ? (
            <span className={styles['ts-viewer-all-i']}>{Icons.team}</span>
          ) : (
            <Avatar name={viewer.name} hue={viewer.hue} size="sm" />
          )}
          <span
            className={styles['ts-viewer-label']}
            title={isAll ? 'Усі' : isSelf ? 'Мій режим' : viewer.name}
          >
            {isAll ? 'Усі' : isSelf ? 'Мій' : viewer.name.split(' ')[0]}
          </span>
          <span className={styles['ts-viewer-chev']} aria-hidden>
            {Icons.chevD}
          </span>
        </button>
        {showClear ? (
          <button
            type="button"
            className={styles['ts-viewer-clear']}
            aria-label="Повернутися до мого режиму"
            onClick={resetToSelf}
          >
            {Icons.close}
          </button>
        ) : null}
      </div>
      {menu}
    </div>
  );
}
