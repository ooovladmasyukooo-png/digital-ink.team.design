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
  addTeamMember,
  positionMeta,
  PROJECT_TEAM_POSITIONS,
  removeTeamMember,
  toggleMemberPosition,
} from '../projectTeam';
import type { ProjectTeamAssignment, ProjectTeamPositionId } from '../types';
import styles from '../projects2.module.css';

const VIEWPORT_MARGIN = 8;
const POP_GAP = 6;

function computePopPosition(anchor: HTMLElement, pop: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let pw = pop.offsetWidth;
  let ph = pop.offsetHeight;
  if (pw < 48) pw = 300;
  if (ph < 48) ph = 280;

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

interface ProjectTeamPopoverProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  assignments: ProjectTeamAssignment[];
  onClose: () => void;
  onChange: (assignments: ProjectTeamAssignment[]) => void;
}

export function ProjectTeamPopover({
  open,
  anchorRef,
  assignments,
  onClose,
  onChange,
}: ProjectTeamPopoverProps) {
  const popRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [posEditorId, setPosEditorId] = useState<string | null>(null);

  const assignedIds = new Set(assignments.map((row) => row.memberId));
  const availableMembers = teamMembers.filter((m) => !assignedIds.has(m.id));

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    setStyle(computePopPosition(anchor, pop));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition, assignments.length, adding, posEditorId]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setAdding(false);
      setPosEditorId(null);
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

  const pickMember = (memberId: string) => {
    onChange(addTeamMember(assignments, memberId));
    setAdding(false);
    setQuery('');
    setPosEditorId(memberId);
  };

  const filteredAvailable = availableMembers.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
  });

  if (!open) return null;

  return createPortal(
    <div
      ref={popRef}
      className={styles['p2-team-pop']}
      style={{ ...style, width: 300, right: 'auto' }}
      role="dialog"
      aria-label="Команда проєкту"
    >
      <div className={styles['p2-team-pop-head']}>
        <span className={styles['p2-team-pop-title']}>Команда проєкту</span>
        <span className={styles['p2-team-pop-hint']}>Одна людина — кілька позицій</span>
      </div>

      <div className={styles['p2-team-pop-list']}>
        {assignments.length === 0 ? (
          <p className={styles['p2-team-pop-empty']}>Додайте спеціаліста та призначте ролі на проєкті.</p>
        ) : (
          assignments.map((row) => {
            const member = teamById[row.memberId];
            const name = member?.name ?? row.memberId;
            const posOpen = posEditorId === row.memberId;

            return (
              <div key={row.id} className={styles['p2-team-item']}>
                <div className={styles['p2-team-item-top']}>
                  <div className={styles['p2-team-item-person']}>
                    <Avatar name={name} hue={member?.hue ?? 0} size="sm" />
                    <span className={styles['p2-team-item-meta']}>
                      <span className={styles['p2-team-item-name']}>{name}</span>
                      {member?.role ? (
                        <span className={styles['p2-team-item-role']}>{member.role}</span>
                      ) : null}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles['p2-team-item-remove']}
                    aria-label={`Прибрати ${name}`}
                    onClick={() => {
                      onChange(removeTeamMember(assignments, row.memberId));
                      if (posEditorId === row.memberId) setPosEditorId(null);
                    }}
                  >
                    {Icons.close}
                  </button>
                </div>

                <div className={styles['p2-team-tags']}>
                  {row.positions.map((positionId) => {
                    const position = positionMeta(positionId);
                    return (
                      <span key={positionId} className={styles['p2-team-tag']}>
                        <span title={position.label}>{position.short}</span>
                        <button
                          type="button"
                          className={styles['p2-team-tag-x']}
                          aria-label={`Прибрати позицію ${position.label}`}
                          onClick={() =>
                            onChange(
                              toggleMemberPosition(assignments, row.memberId, positionId),
                            )
                          }
                        >
                          {Icons.close}
                        </button>
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    className={cx(
                      styles['p2-team-pos-toggle'],
                      posOpen && styles['p2-team-pos-toggle-on'],
                    )}
                    aria-expanded={posOpen}
                    onClick={() => setPosEditorId(posOpen ? null : row.memberId)}
                  >
                    <span className={cx(styles['p2-team-pos-chev'], posOpen && styles['p2-team-pos-chev-up'])} aria-hidden>
                      {Icons.chevD}
                    </span>
                    <span>{row.positions.length === 0 ? 'Позиції' : 'Ще'}</span>
                  </button>
                </div>

                {posOpen ? (
                  <div className={styles['p2-team-pos-panel']} role="group" aria-label={`Позиції: ${name}`}>
                    {PROJECT_TEAM_POSITIONS.map((position) => {
                      const active = row.positions.includes(position.id);
                      return (
                        <label key={position.id} className={styles['p2-team-pos-opt']}>
                          <input
                            type="checkbox"
                            className={styles['p2-team-pos-check']}
                            checked={active}
                            onChange={() =>
                              onChange(
                                toggleMemberPosition(
                                  assignments,
                                  row.memberId,
                                  position.id as ProjectTeamPositionId,
                                ),
                              )
                            }
                          />
                          <span className={styles['p2-team-pos-opt-label']}>{position.label}</span>
                          <span className={styles['p2-team-pos-opt-short']}>{position.short}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className={styles['p2-team-pop-foot']}>
        {adding ? (
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
              {filteredAvailable.length === 0 ? (
                <li className={styles['p2-team-pick-empty']}>Нікого не знайдено</li>
              ) : (
                filteredAvailable.map((m) => (
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
            <button
              type="button"
              className={styles['p2-team-foot-cancel']}
              onClick={() => {
                setAdding(false);
                setQuery('');
              }}
            >
              Скасувати
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles['p2-team-foot-add']}
            disabled={availableMembers.length === 0}
            onClick={() => setAdding(true)}
          >
            {Icons.plus}
            <span>Додати спеціаліста</span>
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
