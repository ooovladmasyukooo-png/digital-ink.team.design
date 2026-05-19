import { Icons } from '../../../shared/components/Icon';
import styles from '../projects.module.css';

interface ProjectComingSoonProps {
  subtitle: string;
}

export function ProjectComingSoon({ subtitle }: ProjectComingSoonProps) {
  return (
    <div className={styles['team-coming-soon']} role="status">
      <div className={styles['team-coming-soon-ic']} aria-hidden>
        {Icons.lock}
      </div>
      <p className={styles['team-coming-soon-t']}>Coming soon</p>
      <p className={styles['team-coming-soon-sub']}>{subtitle}</p>
    </div>
  );
}
