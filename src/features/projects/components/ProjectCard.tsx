import { Avatar } from '../../../shared/components/Avatar';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects.module.css';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <button className={styles['tlp-card']} onClick={() => onSelect(project.id)} type="button">
      <span className={styles['tlp-av']}>
        <Avatar name={project.name} hue={project.hue} />
        <span className={cx(styles['tlp-online'], project.status === 'active' ? styles.on : styles.off)} />
      </span>
      <span className={styles['tlp-body']}>
        <span className={styles['tlp-name-row']}>
          <span className={styles['tlp-name']}>{project.name}</span>
          <span className={cx(styles['tlp-tag'], styles[project.status])}>
            {project.status === 'active' ? 'Active' : 'Paused'}
          </span>
        </span>
        <span className={styles['tlp-role']}>{project.role}</span>
      </span>
    </button>
  );
}
