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
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { teamMembers } from '../../team/data';
import { teamById } from '../../tasks/taskOptions';
import {
  addTeamAccess,
  isTeamAccessTaken,
  positionMeta,
  PROJECT_TEAM_POSITIONS,
  removeTeamAccess,
  updateTeamAccessPosition,
} from '../projectTeam';
import type { ProjectTeamAssignment, ProjectTeamPositionId } from '../types';
import styles from '../projects2.module.css';

const VIEWPORT_MARGIN = 8;
const POP_GAP = 6;
const POP_WIDTH = 252;

type PanelView = 'list' | 'member' | 'role';

type RolePanelContext = {
  memberId: string;
  accessId?: string;
};

type PopAnchorPoint = { top: number; left: number };

function computePopPosition(anchor: HTMLElement): PopAnchorPoint {
  const rect = anchor.getBoundingClientRect();
  const estimatedHeight = 320;

  let top = rect.bottom + POP_GAP;
  const fitsBelow = top + estimatedHeight <= window.innerHeight - VIEWPORT_MARGIN;
  if (!fitsBelow) {
    const aboveTop = rect.top - POP_GAP - estimatedHeight;
    if (aboveTop >= VIEWPORT_MARGIN) top = aboveTop;
  }

  let left = rect.left;
  if (left + POP_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - POP_WIDTH;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  return { top, left };
}

function memberFirstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

interface ProjectTeamPopoverProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  assignments: ProjectTeamAssignment[];
  onClose: () => void;
  onChange: (assignments: ProjectTeamAssignment[]) => void;
}

export function ProjectTeamPopover({
  open,
  anchorRef,
  triggerRef,
  assignments,
  onClose,
  onChange,
}: ProjectTeamPopoverProps) {
  const popRef = useRef<HTMLDivElement>(null);
  const anchorPointRef = useRef<PopAnchorPoint | null>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [panel, setPanel] = useState<PanelView>('list');
  const [roleContext, setRoleContext] = useState<RolePanelContext | null>(null);
  const [query, setQuery] = useState('');

  const activeMembers = teamMembers.filter((m) => m.status === 'active');

  const applyPosition = useCallback((point: PopAnchorPoint) => {
    setStyle({
      position: 'fixed',
      top: point.top,
      left: point.left,
      zIndex: 320,
      width: POP_WIDTH,
    });
  }, []);

  const reposition = useCallback(
    (resetAnchor = false) => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      if (!resetAnchor && anchorPointRef.current) {
        applyPosition(anchorPointRef.current);
        return;
      }

      const point = computePopPosition(anchor);
      anchorPointRef.current = point;
      applyPosition(point);
    },
    [anchorRef, applyPosition],
  );

  const resetFlow = useCallback(() => {
    setPanel('list');
    setRoleContext(null);
    setQuery('');
  }, []);

  const goBack = useCallback(() => {
    if (panel === 'role' && roleContext && !roleContext.accessId) {
      setPanel('member');
      setRoleContext(null);
      return;
    }
    resetFlow();
  }, [panel, roleContext, resetFlow]);

  useLayoutEffect(() => {
    if (!open) {
      anchorPointRef.current = null;
      return;
    }
    reposition(true);
  }, [open, reposition]);

  useEffect(() => {
    if (!open) {
      resetFlow();
      return;
    }
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (panel !== 'list') {
        goBack();
        return;
      }
      onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    const onViewportChange = () => reposition(true);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open, onClose, reposition, anchorRef, triggerRef, panel, goBack, resetFlow]);

  const openRolePanel = (ctx: RolePanelContext) => {
    setRoleContext(ctx);
    setPanel('role');
    setQuery('');
  };

  const pickMember = (memberId: string) => {
    openRolePanel({ memberId });
  };

  const pickRole = (position: ProjectTeamPositionId) => {
    if (!roleContext) return;
    if (roleContext.accessId) {
      onChange(updateTeamAccessPosition(assignments, roleContext.accessId, position));
    } else {
      onChange(addTeamAccess(assignments, roleContext.memberId, position));
    }
    resetFlow();
  };

  const filteredMembers = activeMembers.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
  });

  const roleMember = roleContext ? teamById[roleContext.memberId] : null;
  const roleMemberName = roleMember?.name ?? roleContext?.memberId ?? '';

  let headTitle = 'Команда проєкту';
  if (panel === 'member') headTitle = 'Додати доступ';
  if (panel === 'role') headTitle = `Позиція · ${memberFirstName(roleMemberName)}`;

  if (!open) return null;

  return createPortal(
    <div
      ref={popRef}
      className={styles['p2-team-pop']}
      style={style}
      role="dialog"
      aria-label="Команда проєкту"
    >
      <div className={styles['p2-team-pop-head']}>
        {panel !== 'list' ? (
          <button type="button" className={styles['p2-team-pop-back']} onClick={goBack}>
            <span className={styles['p2-team-pop-back-i']} aria-hidden>
              {Icons.chevR}
            </span>
            <span>Назад</span>
          </button>
        ) : null}
        <span className={styles['p2-team-pop-title']}>{headTitle}</span>
        {panel === 'list' && assignments.length > 0 ? (
          <span className={styles['p2-team-pop-count']}>{assignments.length}</span>
        ) : null}
      </div>

      <div className={styles['p2-team-pop-body']}>
        {panel === 'list' ? (
          assignments.length === 0 ? (
            <p className={styles['p2-team-pop-empty']}>Ще нікого немає. Додайте доступ нижче.</p>
          ) : (
            <ul className={styles['p2-team-rows']}>
              {assignments.map((row) => {
                const member = teamById[row.memberId];
                const name = member?.name ?? row.memberId;
                const position = positionMeta(row.position);
                return (
                  <li key={row.id} className={styles['p2-team-row']}>
                    <Avatar name={name} hue={member?.hue ?? 0} size="sm" />
                    <span className={styles['p2-team-row-name']} title={name}>
                      {name}
                    </span>
                    <button
                      type="button"
                      className={styles['p2-team-row-role']}
                      title={position.label}
                      aria-label={`Змінити позицію: ${position.label}`}
                      onClick={() => openRolePanel({ memberId: row.memberId, accessId: row.id })}
                    >
                      {position.short}
                    </button>
                    <button
                      type="button"
                      className={styles['p2-team-row-remove']}
                      aria-label={`Прибрати: ${name}, ${position.label}`}
                      onClick={() => onChange(removeTeamAccess(assignments, row.id))}
                    >
                      {Icons.close}
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        ) : null}

        {panel === 'member' ? (
          <>
            <div className={styles['p2-team-search']}>
              <span className={styles['p2-team-search-i']}>{Icons.search}</span>
              <input
                type="search"
                placeholder="Імʼя або посада…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <ul className={styles['p2-team-pick-list']}>
              {filteredMembers.length === 0 ? (
                <li className={styles['p2-team-pick-empty']}>Нікого не знайдено</li>
              ) : (
                filteredMembers.map((m) => (
                  <li key={m.id}>
                    <button type="button" className={styles['p2-team-pick-btn']} onClick={() => pickMember(m.id)}>
                      <Avatar name={m.name} hue={m.hue} size="sm" />
                      <span className={styles['p2-team-pick-meta']}>
                        <span>{m.name}</span>
                        <span className={styles['p2-team-pick-role']}>{m.role}</span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        ) : null}

        {panel === 'role' && roleContext ? (
          <ul className={styles['p2-team-role-list']}>
            {PROJECT_TEAM_POSITIONS.map((option) => {
              const taken = isTeamAccessTaken(
                assignments,
                roleContext.memberId,
                option.id,
                roleContext.accessId,
              );
              const active =
                roleContext.accessId != null &&
                assignments.find((row) => row.id === roleContext.accessId)?.position === option.id;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    className={cx(
                      styles['p2-team-role-opt'],
                      active && styles['p2-team-role-opt-on'],
                      taken && styles['p2-team-role-opt-taken'],
                    )}
                    disabled={!roleContext.accessId && taken}
                    title={
                      !roleContext.accessId && taken
                        ? 'У цього спеціаліста вже є такий доступ'
                        : option.label
                    }
                    onClick={() => pickRole(option.id)}
                  >
                    <span className={styles['p2-team-role-opt-short']}>{option.short}</span>
                    <span className={styles['p2-team-role-opt-label']}>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {panel === 'list' ? (
        <div className={styles['p2-team-pop-foot']}>
          <button
            type="button"
            className={cx('red-out-btn', styles['p2-team-pop-add'])}
            onClick={() => setPanel('member')}
          >
            {Icons.plus}
            Додати доступ
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
