import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { ProjectSettingsPanel } from './ProjectSettingsPanel';
import type { Project, ProjectPatch } from '../types';
import styles from '../projects2.module.css';

interface ProjectCrumbSettingsButtonProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (field: keyof ProjectPatch, value: string) => void;
  onPatch: (patch: ProjectPatch) => void;
  onDeleteProject: () => void;
}

export function ProjectCrumbSettingsButton({
  project,
  open,
  onOpenChange,
  onSave,
  onPatch,
  onDeleteProject,
}: ProjectCrumbSettingsButtonProps) {
  useEffect(() => {
    onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close when switching project only
  }, [project.id]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  return (
    <>
      <button
        type="button"
        className={cx(styles['p2-crumb-settings'], open && styles.on)}
        data-p2-settings-trigger
        aria-label="Налаштування проєкту"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
      >
        {Icons.settings}
      </button>

      {open
        ? createPortal(
            <>
              <button
                type="button"
                className={styles['p2-settings-backdrop']}
                aria-label="Закрити налаштування"
                onClick={() => onOpenChange(false)}
              />
              <aside
                className={styles['p2-settings-drawer']}
                role="dialog"
                aria-modal="true"
                aria-label="Налаштування проєкту"
              >
                <div className={styles['p2-settings-pop-head']}>
                  <span className={styles['p2-settings-pop-title']}>Налаштування</span>
                  <button
                    type="button"
                    className={styles['p2-settings-pop-close']}
                    aria-label="Закрити"
                    onClick={() => onOpenChange(false)}
                  >
                    {Icons.close}
                  </button>
                </div>
                <div className={styles['p2-settings-pop-body']}>
                  <div className={styles['p2-settings-pop-panel']}>
                    <ProjectSettingsPanel
                      project={project}
                      onSave={onSave}
                      onPatch={onPatch}
                      onDeleteProject={onDeleteProject}
                    />
                  </div>
                </div>
              </aside>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
