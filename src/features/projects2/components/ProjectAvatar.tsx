import { Avatar } from '../../../shared/components/Avatar';
import { cx } from '../../../shared/styles/cx';
import { churnRiskToneClass, normalizeChurnRisk } from '../projectChurnRisk';
import { PROJECT_AVATAR_FALLBACK_HUE, resolveProjectAvatarSrc } from '../projectAvatar';
import styles from '../projects2.module.css';

interface ProjectAvatarProps {
  projectId: string;
  name: string;
  churnRisk: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProjectAvatar({
  projectId,
  name,
  churnRisk,
  src,
  size = 'md',
  className,
}: ProjectAvatarProps) {
  const level = normalizeChurnRisk(churnRisk);
  const toneClass = churnRiskToneClass(level);

  return (
    <span className={cx(styles['p2-project-av'], styles[toneClass], className)}>
      <Avatar
        name={name}
        hue={PROJECT_AVATAR_FALLBACK_HUE}
        src={resolveProjectAvatarSrc(projectId, src)}
        size={size}
      />
    </span>
  );
}
