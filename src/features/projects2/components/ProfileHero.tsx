import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects2.module.css';
import type { Project } from '../types';

interface ProfileHeroProps {
  project: Project;
  avatarSrc?: string | null;
  projectPhotoSrc?: string | null;
  onPickAvatar: () => void;
  onPickProjectPhoto: () => void;
}

export function ProfileHero({ project, avatarSrc, projectPhotoSrc, onPickAvatar, onPickProjectPhoto }: ProfileHeroProps) {
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
              <Avatar name={project.name} hue={project.hue} src={avatarSrc} size="lg" />
            </span>
            <span className={styles['avatar-upload-overlay']} aria-hidden>
              <span className={styles['avatar-upload-overlay-ic']}>{Icons.camera}</span>
              <span className={styles['avatar-upload-overlay-t']}>Змінити</span>
            </span>
          </button>
          <div className={styles['photo-upload-body']}>
            <div className={styles['photo-upload-title']}>Аватарка</div>
            <div className={styles['photo-upload-sub']}>Фото майстра або логотип студії</div>
            <button className={cx('ghost-btn sm', styles['avatar-upload-secondary'])} type="button" onClick={onPickAvatar}>
              Завантажити фото
            </button>
          </div>
        </div>
        <div className={styles['photo-upload']}>
          <div className={styles['photo-upload-preview']}>
            {projectPhotoSrc ? <img src={projectPhotoSrc} alt="Фото проєкту" /> : <span>{Icons.briefcase}</span>}
          </div>
          <div className={styles['photo-upload-body']}>
            <div className={styles['photo-upload-title']}>Фото проєкту</div>
            <div className={styles['photo-upload-sub']}>Фото, яке можна показувати портфоліо або студії</div>
            <button className="ghost-btn sm" type="button" onClick={onPickProjectPhoto}>
              Завантажити
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
