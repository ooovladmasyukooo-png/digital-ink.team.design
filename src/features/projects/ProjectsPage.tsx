import { useState } from 'react';
import { Icons } from '../../shared/components/Icon';
import { Topbar } from '../../shared/components/Topbar';
import { cx } from '../../shared/styles/cx';
import { projects } from './data';
import styles from './projects.module.css';
import type { ProjectStatus } from './types';

export function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const filtered = projects.filter((project) => filter === 'all' || project.status === filter);
  const stats = {
    all: projects.length,
    active: projects.filter((project) => project.status === 'active').length,
    paused: projects.filter((project) => project.status === 'paused').length,
    archived: projects.filter((project) => project.status === 'archived').length,
  };

  return (
    <div className="page-shell">
      <Topbar
        title="Усі проєкти"
        subtitle={`${projects.length} проєктів · ${stats.active} активних`}
        right={
          <>
            <button className="red-out-btn" type="button">{Icons.plus} Додати слот</button>
            <button className="prim-btn" type="button">{Icons.plus} Новий проєкт</button>
          </>
        }
      />
      <div className="page">
        <div className="card filter-card">
          <div className="tabs">
            <button className={`tab ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')} type="button">Усі<span className="tab-n">{stats.all}</span></button>
            <button className={`tab ${filter === 'active' ? 'on' : ''}`} onClick={() => setFilter('active')} type="button">Активні<span className="tab-n">{stats.active}</span></button>
            <button className={`tab ${filter === 'paused' ? 'on' : ''}`} onClick={() => setFilter('paused')} type="button">На паузі<span className="tab-n">{stats.paused}</span></button>
            <button className={`tab ${filter === 'archived' ? 'on' : ''}`} onClick={() => setFilter('archived')} type="button">Архів<span className="tab-n">{stats.archived}</span></button>
          </div>
          <div className="card-h-r">
            <button className="ghost-btn" type="button">{Icons.filter} Регіон</button>
            <button className="ghost-btn" type="button">{Icons.download} Експорт</button>
          </div>
        </div>

        <div className={styles['prj-grid']}>
          {filtered.map((project) => (
            <article key={project.name} className={styles['prj-card']}>
              <div className={styles['prj-thumb']} style={{ background: `oklch(0.32 0.08 ${project.hue})`, color: `oklch(0.92 0.05 ${project.hue})` }}>
                {project.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                <div className={styles['prj-thumb-overlay']} />
                <span className={cx(styles['prj-status'], styles[project.status])} />
              </div>
              <div className={styles['prj-body']}>
                <div className={styles['prj-name']}>{project.name}</div>
                <div className={styles['prj-loc']}>{project.loc} {project.country ? <span className="flag">{project.country}</span> : null}</div>
                <div className={cx(styles['prj-foot'], 'mono')}>{project.total} робіт</div>
              </div>
              <div className={styles['prj-metrics']}>
                <span className={cx(styles['prj-pill'], project.open ? styles.has : undefined)}>{Icons.briefcase}{project.open}</span>
                <span className={cx(styles['prj-pill'], project.sched ? styles['has-purple'] : undefined)}>{Icons.calendar}{project.sched}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
