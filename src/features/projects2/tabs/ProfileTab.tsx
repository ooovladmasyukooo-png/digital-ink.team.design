import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { ProjectProfileHeader } from '../components/ProjectProfileHeader';
import { EditableField } from '../components/EditableField';
import styles from '../projects2.module.css';
import type { Project, ProjectPatch } from '../types';

interface ProfileTabProps {
  project: Project;
  avatarSrc?: string | null;
  onPickAvatar: () => void;
  onSave: (field: keyof ProjectPatch, value: string) => void;
  onPatch: (patch: ProjectPatch) => void;
}

export function ProfileTab({ project, avatarSrc, onPickAvatar, onSave, onPatch }: ProfileTabProps) {
  return (
    <div className={styles['p2-profile']}>
      <ProjectProfileHeader
        project={project}
        avatarSrc={avatarSrc}
        onPickAvatar={onPickAvatar}
        onSave={onSave}
        onPatch={onPatch}
      />

      <div className={styles['p2-profile-divider']} aria-hidden />

      <div className={cx(styles['p2-profile-body'], styles['p2-profile-body-single'])}>
        <section className={styles['p2-sect']}>
          <h3 className={styles['p2-sect-t']}>Клієнт</h3>
          <EditableField
            icon={Icons.team}
            label="Про клієнта"
            value={project.aboutClient}
            fieldKey="aboutClient"
            onSave={onSave}
            multiline
          />
          <EditableField
            icon={Icons.description}
            label="Замітки MB + PM"
            value={project.mbPmComment}
            fieldKey="mbPmComment"
            onSave={onSave}
            multiline
          />
        </section>
      </div>
    </div>
  );
}
