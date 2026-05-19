import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Icons } from '../../shared/components/Icon';
import { Topbar } from '../../shared/components/Topbar';
import { cx } from '../../shared/styles/cx';
import { MemberCard } from './components/MemberCard';
import { TEAM_ROLE_OPTIONS } from './roleOptions';
import styles from './team.module.css';
import type { TeamMember } from './types';

interface TeamListProps {
  members: TeamMember[];
  onSelect: (id: string) => void;
}

export function TeamList({ members, onSelect }: TeamListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [roleOpen, setRoleOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePosition, setInvitePosition] = useState(TEAM_ROLE_OPTIONS[0] ?? '');
  const emailRef = useRef<HTMLInputElement>(null);

  const roles = useMemo(() => {
    const roleCounts = new Map<string, number>();
    members.forEach((member) => roleCounts.set(member.role, (roleCounts.get(member.role) ?? 0) + 1));
    return Array.from(roleCounts, ([role, n]) => ({ role, n }));
  }, [members]);

  const filtered = members.filter((member) => {
    if (filter !== 'all' && member.role !== filter) return false;
    const searchText = `${member.name} ${member.username}`.toLowerCase();
    return !query || searchText.includes(query.toLowerCase());
  });

  const activeMembers = filtered.filter((member) => member.status === 'active');
  const inactiveMembers = filtered.filter((member) => member.status !== 'active');

  const closeInvite = useCallback(() => {
    setInviteOpen(false);
    setInviteEmail('');
    setInvitePosition(TEAM_ROLE_OPTIONS[0] ?? '');
  }, []);

  useEffect(() => {
    if (!inviteOpen) return;
    const id = requestAnimationFrame(() => emailRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [inviteOpen]);

  useEffect(() => {
    if (!inviteOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeInvite();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [inviteOpen, closeInvite]);

  const onInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    closeInvite();
  };

  const inviteModal =
    inviteOpen &&
    createPortal(
      <div
        className={styles['invite-backdrop']}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeInvite();
        }}
      >
        <div
          className={styles['invite-modal']}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-dialog-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className={styles['invite-head']}>
            <div className={styles['invite-head-text']}>
              <h2 id="invite-dialog-title" className={styles['invite-title']}>
                Запросити в команду
              </h2>
              <p className={styles['invite-sub']}>Вкажіть пошту та позицію спеціаліста — ми надішлемо запрошення.</p>
            </div>
            <button type="button" className="icon-btn sm" aria-label="Закрити" onClick={closeInvite}>
              <Icon d={<path d="M18 6 6 18M6 6l12 12" />} size={14} sw={1.8} />
            </button>
          </div>
          <form className={styles['invite-modal-form']} onSubmit={onInviteSubmit}>
            <div className={styles['invite-form']}>
              <div className={styles['invite-row']}>
                <label className={styles['invite-l']} htmlFor="invite-email">
                  Електронна пошта
                </label>
                <input
                  ref={emailRef}
                  id="invite-email"
                  className={styles['field-in']}
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  required
                />
              </div>
              <div className={styles['invite-row']}>
                <label className={styles['invite-l']} htmlFor="invite-position">
                  Позиція спеціаліста
                </label>
                <div className={`${styles['field-v-wrap']} ${styles['select-wrap']}`}>
                  <select
                    id="invite-position"
                    className={`${styles['field-in']} ${styles['field-select']}`}
                    value={invitePosition}
                    onChange={(event) => setInvitePosition(event.target.value)}
                    required
                  >
                    {TEAM_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <span className={styles['select-chev']} aria-hidden>
                    {Icons.chevD}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles['invite-actions']}>
              <button type="button" className="ghost-btn" onClick={closeInvite}>
                Скасувати
              </button>
              <button type="submit" className="prim-btn">
                Надіслати запрошення
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <div className={styles['team-shell']}>
        <Topbar title={<span className={styles['tb-title-row']}>Команда<span className={styles['tb-title-n']}>{members.length}</span></span>} />
        <div className={styles['team-list-page']}>
          <div className={styles['tlp-filter']}>
            <div className={styles['tlp-search']}>
              {Icons.search}
              <input placeholder="Пошук учасників..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className={styles['tlp-role-filter']}>
              <button className={cx(styles['tlp-role-btn'], roleOpen && styles.on)} onClick={() => setRoleOpen((open) => !open)} type="button">
                {Icons.filter}
                <span>{filter === 'all' ? 'Усі ролі' : filter}</span>
                <span className={styles['team-chip-n']}>{filtered.length}</span>
                {Icons.chevD}
              </button>
              {roleOpen ? (
                <div className={styles['tlp-role-menu']}>
                  <button className={cx(styles['tlp-role-option'], filter === 'all' && styles.on)} onClick={() => { setFilter('all'); setRoleOpen(false); }} type="button">
                    <span>Усі ролі</span><span className={styles['team-chip-n']}>{members.length}</span>
                  </button>
                  {roles.map((role) => (
                    <button key={role.role} className={cx(styles['tlp-role-option'], filter === role.role && styles.on)} onClick={() => { setFilter(role.role); setRoleOpen(false); }} type="button">
                      <span>{role.role}</span><span className={styles['team-chip-n']}>{role.n}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button className="red-out-btn" type="button" onClick={() => setInviteOpen(true)}>
              {Icons.plus} Запросити
            </button>
          </div>

          <div className={styles['tlp-groups']}>
            {activeMembers.length ? <section className={styles['tlp-group']}><div className={styles['tlp-group-h']}>Активні<span>{activeMembers.length}</span></div><div className={styles['tlp-grid']}>{activeMembers.map((member) => <MemberCard key={member.id} member={member} onSelect={onSelect} />)}</div></section> : null}
            {inactiveMembers.length ? <section className={styles['tlp-group']}><div className={styles['tlp-group-h']}>Неактивні<span>{inactiveMembers.length}</span></div><div className={styles['tlp-grid']}>{inactiveMembers.map((member) => <MemberCard key={member.id} member={member} onSelect={onSelect} />)}</div></section> : null}
            {!filtered.length ? <div className={styles['tlp-empty']}><div className={styles['tlp-empty-i']}>{Icons.team}</div><div>Нікого не знайдено</div><div className="muted xs">Спробуй змінити фільтри</div></div> : null}
          </div>
        </div>
      </div>
      {inviteModal}
    </>
  );
}
