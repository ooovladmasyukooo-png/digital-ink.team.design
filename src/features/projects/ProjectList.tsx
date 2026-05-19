import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Icons } from '../../shared/components/Icon';
import { Topbar } from '../../shared/components/Topbar';
import { cx } from '../../shared/styles/cx';
import { ProjectCard } from './components/ProjectCard';
import { PROJECT_STYLE_OPTIONS } from './roleOptions';
import styles from './projects.module.css';
import type { Project } from './types';

interface ProjectListProps {
  projects: Project[];
  onSelect: (id: string) => void;
}

export function ProjectList({ projects, onSelect }: ProjectListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [roleOpen, setRoleOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePosition, setInvitePosition] = useState(PROJECT_STYLE_OPTIONS[0] ?? '');
  const emailRef = useRef<HTMLInputElement>(null);

  const roles = useMemo(() => {
    const roleCounts = new Map<string, number>();
    projects.forEach((project) => roleCounts.set(project.role, (roleCounts.get(project.role) ?? 0) + 1));
    return Array.from(roleCounts, ([role, n]) => ({ role, n }));
  }, [projects]);

  const filtered = projects.filter((project) => {
    if (filter !== 'all' && project.role !== filter) return false;
    const searchText = `${project.name} ${project.username}`.toLowerCase();
    return !query || searchText.includes(query.toLowerCase());
  });

  const activeProjects = filtered.filter((project) => project.status === 'active');
  const inactiveProjects = filtered.filter((project) => project.status !== 'active');

  const closeInvite = useCallback(() => {
    setInviteOpen(false);
    setInviteEmail('');
    setInvitePosition(PROJECT_STYLE_OPTIONS[0] ?? '');
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
                Додати проєкт
              </h2>
              <p className={styles['invite-sub']}>Вкажіть контакт студії або майстра — ми надішлемо запрошення в CRM.</p>
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
                  Стиль / напрям
                </label>
                <div className={`${styles['field-v-wrap']} ${styles['select-wrap']}`}>
                  <select
                    id="invite-position"
                    className={`${styles['field-in']} ${styles['field-select']}`}
                    value={invitePosition}
                    onChange={(event) => setInvitePosition(event.target.value)}
                    required
                  >
                    {PROJECT_STYLE_OPTIONS.map((role) => (
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
        <Topbar title={<span className={styles['tb-title-row']}>Проєкти<span className={styles['tb-title-n']}>{projects.length}</span></span>} />
        <div className={styles['team-list-page']}>
          <div className={styles['tlp-filter']}>
            <div className={styles['tlp-search']}>
              {Icons.search}
              <input placeholder="Пошук проєктів..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className={styles['tlp-role-filter']}>
              <button className={cx(styles['tlp-role-btn'], roleOpen && styles.on)} onClick={() => setRoleOpen((open) => !open)} type="button">
                {Icons.filter}
                <span>{filter === 'all' ? 'Усі стилі' : filter}</span>
                <span className={styles['team-chip-n']}>{filtered.length}</span>
                {Icons.chevD}
              </button>
              {roleOpen ? (
                <div className={styles['tlp-role-menu']}>
                  <button className={cx(styles['tlp-role-option'], filter === 'all' && styles.on)} onClick={() => { setFilter('all'); setRoleOpen(false); }} type="button">
                    <span>Усі стилі</span><span className={styles['team-chip-n']}>{projects.length}</span>
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
              {Icons.plus} Додати проєкт
            </button>
          </div>

          <div className={styles['tlp-groups']}>
            {activeProjects.length ? <section className={styles['tlp-group']}><div className={styles['tlp-group-h']}>Активні<span>{activeProjects.length}</span></div><div className={styles['tlp-grid']}>{activeProjects.map((project) => <ProjectCard key={project.id} project={project} onSelect={onSelect} />)}</div></section> : null}
            {inactiveProjects.length ? <section className={styles['tlp-group']}><div className={styles['tlp-group-h']}>Неактивні<span>{inactiveProjects.length}</span></div><div className={styles['tlp-grid']}>{inactiveProjects.map((project) => <ProjectCard key={project.id} project={project} onSelect={onSelect} />)}</div></section> : null}
            {!filtered.length ? <div className={styles['tlp-empty']}><div className={styles['tlp-empty-i']}>{Icons.briefcase}</div><div>Проєктів не знайдено</div><div className="muted xs">Спробуй змінити фільтри</div></div> : null}
          </div>
        </div>
      </div>
      {inviteModal}
    </>
  );
}
