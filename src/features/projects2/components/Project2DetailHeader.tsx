import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects2.module.css';
import type { Project, ProjectSubtabId } from '../types';

const DETAIL_TABS: { id: ProjectSubtabId; label: string; icon: ReactNode }[] = [
  { id: 'profile', label: 'Головна', icon: Icons.dashboard },
  { id: 'payouts', label: 'Виплати', icon: Icons.finance },
  { id: 'effectiveness', label: 'Ефективність', icon: Icons.analytics },
  { id: 'settings', label: 'Налаштування', icon: Icons.settings },
];

interface Project2DetailHeaderProps {
  project: Project;
  activeProjects: Project[];
  projectAvatars: Record<string, string>;
  avatarSrc?: string | null;
  activeSubtab: ProjectSubtabId;
  onBack: () => void;
  onSubtabChange: (tab: ProjectSubtabId) => void;
  onSwitchProject: (projectId: string) => void;
}

export function Project2DetailHeader({
  project,
  activeProjects,
  projectAvatars,
  avatarSrc,
  activeSubtab,
  onBack,
  onSubtabChange,
  onSwitchProject,
}: Project2DetailHeaderProps) {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuSearch, setProjectMenuSearch] = useState('');
  const projectMenuSearchRef = useRef<HTMLInputElement>(null);
  const projectMenuWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectMenuOpen) {
      setProjectMenuSearch('');
      return;
    }
    const id = requestAnimationFrame(() => projectMenuSearchRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [projectMenuOpen]);

  useEffect(() => {
    setProjectMenuOpen(false);
  }, [project.id]);

  useEffect(() => {
    if (!projectMenuOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        projectMenuWrapRef.current?.contains(target) ||
        target.closest('.pop') ||
        target.closest('[data-p2-project-trigger]')
      ) {
        return;
      }
      setProjectMenuOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [projectMenuOpen]);

  const searchQuery = projectMenuSearch.trim().toLowerCase();
  const filteredProjects = activeProjects.filter((item) => {
    if (!searchQuery) return true;
    const haystack = `${item.name} ${item.username} ${item.role}`.toLowerCase();
    return haystack.includes(searchQuery);
  });

  return (
    <header className={styles['p2-stacked-header']}>
      <div className={styles['p2-stacked-top']}>
        <nav className={styles['p2-crumb']} aria-label="Навігація">
          <button
            type="button"
            className={cx(styles['p2-crumb-text'], styles['p2-crumb-root'])}
            onClick={onBack}
          >
            Проєкти
          </button>
          <span className={cx(styles['p2-crumb-text'], styles['p2-crumb-sep'])} aria-hidden>
            /
          </span>
          <div ref={projectMenuWrapRef} className={styles['p2-crumb-project-wrap']}>
            <button
              type="button"
              className={cx(styles['p2-crumb-project'], projectMenuOpen && styles.on)}
              data-p2-project-trigger
              aria-expanded={projectMenuOpen}
              aria-haspopup="menu"
              onClick={() => setProjectMenuOpen((open) => !open)}
            >
              <Avatar name={project.name} hue={project.hue} src={avatarSrc} size="sm" />
              <span className={cx(styles['p2-crumb-text'], styles['p2-crumb-label'])} title={project.name}>
                {project.name}
              </span>
              <span className={styles['p2-crumb-chev']} aria-hidden>
                {Icons.chevD}
              </span>
            </button>
            {projectMenuOpen ? (
              <div className={cx('pop', 'pop-tab-menu', styles['p2-project-menu'])} role="menu">
                <div className="pop-tab-menu-search">
                  <label className="pop-tab-menu-search-in">
                    <span className="pop-tab-menu-search-i">{Icons.search}</span>
                    <input
                      ref={projectMenuSearchRef}
                      type="search"
                      value={projectMenuSearch}
                      onChange={(event) => setProjectMenuSearch(event.target.value)}
                      placeholder="Пошук..."
                      aria-label="Пошук проєктів"
                    />
                  </label>
                </div>
                <div className="pop-tab-list">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((item) => (
                      <button
                        key={item.id}
                        className={cx('pop-row', item.id === project.id && 'on')}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          onSwitchProject(item.id);
                          setProjectMenuOpen(false);
                        }}
                      >
                        <span className="pop-row-i">
                          <Avatar
                            name={item.name}
                            hue={item.hue}
                            src={projectAvatars[item.id]}
                            size="sm"
                          />
                        </span>
                        <span className="pop-row-t">{item.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="pop-tab-empty">Проєктів не знайдено</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
      <nav className={styles['p2-stacked-tabs']} aria-label="Розділи проєкту">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cx(styles['p2-tab'], activeSubtab === tab.id && styles.on)}
            onClick={() => onSubtabChange(tab.id)}
          >
            <span className={styles['p2-tab-i']}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
