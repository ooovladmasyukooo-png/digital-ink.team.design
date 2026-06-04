import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Icons } from '../../shared/components/Icon';
import { cx } from '../../shared/styles/cx';
import { teamById } from '../tasks/taskOptions';
import { ProjectCard } from './components/ProjectCard';
import { Project2ListHeader } from './components/Project2ListHeader';
import { ProjectListCrmView } from './components/ProjectListCrmView';
import { ProjectListToolbar } from './components/ProjectListToolbar';
import { PROJECT_STYLE_OPTIONS } from './roleOptions';
import type { ProjectPipelineStatus } from './projectPipelineStatus';
import {
  buildProjectListGroups,
  collectListDirections,
  filterProjects,
  filterProjectsForCrmBoard,
  DEFAULT_PROJECT_LIST_CHURN_ORDER,
  readProjectListView,
  writeProjectListView,
  type ProjectListFilters,
  type ProjectListGroupBy,
  type ProjectListLayout,
} from './projectListView';
import styles from './projects2.module.css';
import type { Project } from './types';

interface Project2ListProps {
  projects: Project[];
  onSelect: (id: string) => void;
  onMoveProject: (projectId: string, status: ProjectPipelineStatus) => void;
}

export function Project2List({ projects, onSelect, onMoveProject }: Project2ListProps) {
  const initialView = useMemo(() => readProjectListView(), []);
  const [groupBy, setGroupBy] = useState<ProjectListGroupBy>(initialView.groupBy);
  const [filters, setFilters] = useState<ProjectListFilters>(initialView.filters);
  const [layout, setLayout] = useState<ProjectListLayout>(initialView.layout);
  const [query, setQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePosition, setInvitePosition] = useState(PROJECT_STYLE_OPTIONS[0] ?? '');
  const emailRef = useRef<HTMLInputElement>(null);

  const memberNameById = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(teamById).map(([id, member]) => [id, member.name]),
      ) as Record<string, string>,
    [],
  );

  const directionOrder = useMemo(() => collectListDirections(projects), [projects]);

  const filtered = useMemo(
    () => filterProjects(projects, filters, query, groupBy),
    [projects, filters, query, groupBy],
  );

  const crmProjects = useMemo(
    () => filterProjectsForCrmBoard(projects, filters, query, groupBy),
    [projects, filters, query, groupBy],
  );

  const groups = useMemo(
    () =>
      buildProjectListGroups(
        filtered,
        groupBy,
        memberNameById,
        directionOrder,
        DEFAULT_PROJECT_LIST_CHURN_ORDER,
      ),
    [filtered, groupBy, memberNameById, directionOrder],
  );

  useEffect(() => {
    writeProjectListView(groupBy, filters, layout);
  }, [groupBy, filters, layout]);

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
      <div className={styles['p2-shell']}>
        <Project2ListHeader
          count={projects.length}
          action={
            <button className="red-out-btn" type="button" onClick={() => setInviteOpen(true)}>
              {Icons.plus} Додати проєкт
            </button>
          }
        />
        <div
          className={cx(
            styles['team-list-page'],
            layout === 'crm' && styles['p2-list-page-crm'],
          )}
        >
          <ProjectListToolbar
            projects={projects}
            filteredCount={layout === 'crm' ? crmProjects.length : filtered.length}
            layout={layout}
            groupBy={groupBy}
            filters={filters}
            query={query}
            onQueryChange={setQuery}
            onLayoutChange={setLayout}
            onGroupByChange={setGroupBy}
            onFiltersChange={setFilters}
          />

          {layout === 'crm' ? (
            <ProjectListCrmView
              projects={crmProjects}
              groupBy={groupBy}
              churnOrder={DEFAULT_PROJECT_LIST_CHURN_ORDER}
              memberNameById={memberNameById}
              directionOrder={directionOrder}
              onSelect={onSelect}
              onMoveProject={onMoveProject}
            />
          ) : (
            <div className={styles['tlp-groups']}>
              {groups.map((group) => (
                <section key={group.key} className={styles['tlp-group']}>
                  <div className={styles['tlp-group-h']}>
                    {group.label}
                    <span>{group.projects.length}</span>
                  </div>
                  <div className={styles['tlp-grid']}>
                    {group.projects.map((project) => (
                      <ProjectCard key={project.id} project={project} onSelect={onSelect} />
                    ))}
                  </div>
                </section>
              ))}
              {!filtered.length ? (
                <div className={styles['tlp-empty']}>
                  <div className={styles['tlp-empty-i']}>{Icons.briefcase}</div>
                  <div>Проєктів не знайдено</div>
                  <div className="muted xs">Спробуй змінити фільтри або групування</div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {inviteModal}
    </>
  );
}
