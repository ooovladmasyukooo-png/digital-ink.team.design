import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../team.module.css';
import type { TeamMember } from '../types';

interface ProfileHeroProps {
  member: TeamMember;
  avatarSrc?: string | null;
  teamPhotoSrc?: string | null;
  onPickAvatar: () => void;
  onPickTeamPhoto: () => void;
}

export function ProfileHero({ member, avatarSrc, teamPhotoSrc, onPickAvatar, onPickTeamPhoto }: ProfileHeroProps) {
  return (
    <section className={cx(styles['td-sect'], styles['td-sect-hero'])}>
      <div className={styles['prof-media-grid']}>
        <div className={cx(styles['photo-upload'], styles['photo-upload--avatar'])}>
          <button
            type="button"
            className={styles['avatar-upload-hit']}
            onClick={onPickAvatar}
            aria-label="Змінити аватарку"
          >
            <span className={styles['avatar-upload-ring']}>
              <Avatar name={member.name} hue={member.hue} src={avatarSrc} size="lg" />
            </span>
            <span className={styles['avatar-upload-overlay']} aria-hidden>
              <span className={styles['avatar-upload-overlay-ic']}>{Icons.camera}</span>
              <span className={styles['avatar-upload-overlay-t']}>Змінити</span>
            </span>
          </button>
          <div className={styles['photo-upload-body']}>
            <div className={styles['photo-upload-title']}>Аватарка</div>
            <div className={styles['photo-upload-sub']}>Фото, яке використовується в профілі</div>
            <button className={cx('ghost-btn sm', styles['avatar-upload-secondary'])} type="button" onClick={onPickAvatar}>
              Завантажити фото
            </button>
          </div>
        </div>
        <div className={styles['photo-upload']}>
          <div className={styles['photo-upload-preview']}>
            {teamPhotoSrc ? <img src={teamPhotoSrc} alt="Фото для команди" /> : <span>{Icons.team}</span>}
          </div>
          <div className={styles['photo-upload-body']}>
            <div className={styles['photo-upload-title']}>Фото для команди</div>
            <div className={styles['photo-upload-sub']}>Фото, яке можна показувати як частину команди</div>
          </div>
          <button className="ghost-btn sm" type="button" onClick={onPickTeamPhoto}>Завантажити</button>
        </div>
      </div>
    </section>
  );
}
