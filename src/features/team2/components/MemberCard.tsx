import { Avatar } from '../../../shared/components/Avatar';
import { cx } from '../../../shared/styles/cx';
import styles from '../team.module.css';
import type { TeamMember } from '../types';

interface MemberCardProps {
  member: TeamMember;
  onSelect: (id: string) => void;
}

export function MemberCard({ member, onSelect }: MemberCardProps) {
  return (
    <button className={styles['tlp-card']} onClick={() => onSelect(member.id)} type="button">
      <span className={styles['tlp-av']}>
        <Avatar name={member.name} hue={member.hue} />
        <span className={cx(styles['tlp-online'], member.status === 'active' ? styles.on : styles.off)} />
      </span>
      <span className={styles['tlp-body']}>
        <span className={styles['tlp-name-row']}>
          <span className={styles['tlp-name']}>{member.name}</span>
          <span className={cx(styles['tlp-tag'], styles[member.status])}>{member.status === 'active' ? 'Active' : 'Paused'}</span>
        </span>
        <span className={styles['tlp-role']}>{member.role}</span>
      </span>
    </button>
  );
}
