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
import type { TeamMember } from '../../team/types';
import { TASK_CREATOR_ASSIGNEE_ID } from '../../tasks/constants';
import { teamById } from '../../tasks/taskOptions';
import styles from '../../tasks/tasks.module.css';
import { groupViewerMembers, viewerRoleLabel } from '../../tasks/viewerMemberGroups';

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
  const [search, setSearch] = useState('');
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isAll = activeAssigneeId === null;
  const isSelf = activeAssigneeId === TASK_CREATOR_ASSIGNEE_ID;
  const activeMember = activeAssigneeId ? teamById[activeAssigneeId] : null;
  const viewer = activeMember ?? teamById[TASK_CREATOR_ASSIGNEE_ID];
  const showSwapToSelf = isAll;
  const showClear = !isAll;

  const menuMembers = useMemo(() => {
    const ids = new Set(assigneeIds);
    ids.add(TASK_CREATOR_ASSIGNEE_ID);
    const members: TeamMember[] = [];
    for (const id of ids) {
      const member = teamById[id];
      if (member) members.push(member);
    }
    return members.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  }, [assigneeIds]);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      menuMembers.filter((item) => {
        if (!query) return true;
        const haystack = `${item.name} ${item.username} ${item.role}`.toLowerCase();
        return haystack.includes(query);
      }),
    [menuMembers, query],
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
        target.closest('[data-project-assignee-trigger]')
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
        className={cx('pop', 'pop-tab-menu', styles['ts-viewer-menu'], styles['ts-project-assignee-menu'])}
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
              aria-label="Пошук відповідальних"
            />
          </label>
        </div>
        <div className={cx('pop-tab-list', styles['ts-viewer-list'])}>
          {hasList ? (
            <>
              {showAllOption ? (
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
              ) : null}
              {groups.map((group) => (
                <div key={group.role} className={styles['ts-viewer-group']}>
                  <div className={styles['ts-viewer-group-label']}>{viewerRoleLabel(group.role)}</div>
                  {group.members.map((item) => {
                    const itemSelf = item.id === TASK_CREATOR_ASSIGNEE_ID;
                    const selected = activeAssigneeId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        className={cx('pop-row', styles['ts-viewer-row'], selected && 'on')}
                        onClick={() => {
                          onChange(item.id);
                          setOpen(false);
                        }}
                      >
                        <span className="pop-row-i">
                          <Avatar name={item.name} hue={item.hue} size="sm" />
                        </span>
                        <span className="pop-row-t">
                          {itemSelf ? 'Мій' : item.name}
                          {itemSelf ? <span className={styles['ts-viewer-row-tag']}>я</span> : null}
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

  const triggerLabel = isAll ? 'Усі' : isSelf ? 'Мій' : (viewer?.name.split(' ')[0] ?? 'Усі');

  return (
    <div className={styles['ts-viewer-wrap']}>
      <div
        className={cx(
          styles['ts-viewer-cluster'],
          showClear && styles['ts-viewer-cluster-filtered'],
          showSwapToSelf && styles['ts-viewer-cluster-all-swap'],
        )}
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
            showSwapToSelf && styles['ts-viewer-with-swap'],
          )}
          data-project-assignee-trigger
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={
            isAll
              ? 'Усі відповідальні'
              : isSelf
                ? 'Мої задачі проєкту'
                : `Відповідальний: ${viewer?.name ?? ''}`
          }
          onClick={() => setOpen((value) => !value)}
        >
          {isAll ? (
            <span className={styles['ts-viewer-all-i']}>{Icons.team}</span>
          ) : (
            <Avatar name={viewer.name} hue={viewer.hue} size="sm" />
          )}
          <span className={styles['ts-viewer-label']} title={triggerLabel}>
            {triggerLabel}
          </span>
          <span className={styles['ts-viewer-chev']} aria-hidden>
            {Icons.chevD}
          </span>
        </button>
        {showSwapToSelf ? (
          <button
            type="button"
            className={styles['ts-viewer-swap']}
            aria-label="Показати лише мої задачі проєкту"
            onClick={() => {
              onChange(TASK_CREATOR_ASSIGNEE_ID);
              setOpen(false);
            }}
          >
            {Icons.swapArrows}
          </button>
        ) : null}
        {showClear ? (
          <button
            type="button"
            className={styles['ts-viewer-clear']}
            aria-label="Показати задачі всіх відповідальних"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            {Icons.close}
          </button>
        ) : null}
      </div>
      {menu}
    </div>
  );
}
