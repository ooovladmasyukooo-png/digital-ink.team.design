import { Icons } from '../../../shared/components/Icon';
import styles from '../team.module.css';

interface TeamComingSoonProps {
  subtitle: string;
}

export function TeamComingSoon({ subtitle }: TeamComingSoonProps) {
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
