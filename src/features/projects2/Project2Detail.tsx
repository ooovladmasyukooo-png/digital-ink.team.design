import { useRef } from 'react';
import { cx } from '../../shared/styles/cx';
import { Project2DetailHeader } from './components/Project2DetailHeader';
import { ProjectComingSoon } from './components/ProjectComingSoon';
import { ProfileTab } from './tabs/ProfileTab';
import styles from './projects2.module.css';
import type { Project, ProjectPatch, ProjectSubtabId } from './types';

const COMING_SOON_SUBTITLE: Partial<Record<ProjectSubtabId, string>> = {
  tasks: 'Задачі проєкту у розробці.',
  documents: 'Документи проєкту у розробці.',
  'daily-reports': 'Щоденна звітність у розробці.',
  bookings: 'Букінги у розробці.',
  'design-brief': 'ТЗ дизайнеру для проєкту у розробці.',
  invoices: 'Інвойси у розробці.',
  settings: 'Додаткові налаштування проєкту у розробці.',
};

interface Project2DetailProps {
  project: Project;
  activeProjects: Project[];
  projectAvatars: Record<string, string>;
  subtab: ProjectSubtabId;
  avatarSrc?: string | null;
  projectPhotoSrc?: string | null;
  onBack: () => void;
  onSubtabChange: (tab: ProjectSubtabId) => void;
  onSwitchProject: (projectId: string) => void;
  onSave: (projectId: string, field: keyof ProjectPatch, value: string) => void;
  onAvatarChange: (projectId: string, src: string) => void;
  onProjectPhotoChange: (projectId: string, src: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function Project2Detail({
  project,
  activeProjects,
  projectAvatars,
  subtab,
  avatarSrc,
  projectPhotoSrc,
  onBack,
  onSubtabChange,
  onSwitchProject,
  onSave,
  onAvatarChange,
  onProjectPhotoChange,
  onDeleteProject,
}: Project2DetailProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const projectPhotoRef = useRef<HTMLInputElement>(null);

  const pickAvatar = () => {
    fileRef.current?.click();
  };

  const pickProjectPhoto = () => {
    projectPhotoRef.current?.click();
  };

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onAvatarChange(project.id, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProjectPhotoFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onProjectPhotoChange(project.id, reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const save = (field: keyof ProjectPatch, value: string) => onSave(project.id, field, value);

  const isComingSoonView = subtab !== 'profile';

  return (
    <div className={styles['p2-shell']}>
      <Project2DetailHeader
        project={project}
        activeProjects={activeProjects}
        projectAvatars={projectAvatars}
        avatarSrc={avatarSrc}
        activeSubtab={subtab}
        onBack={onBack}
        onSubtabChange={onSubtabChange}
        onSwitchProject={onSwitchProject}
      />
      <main className={cx(styles['team-main'], styles['team-main-full'], isComingSoonView && styles['team-main-flush'])}>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarFile} />
        <input ref={projectPhotoRef} type="file" accept="image/*" className="sr-only" onChange={handleProjectPhotoFile} />
        <div className={cx(styles['td-body'], styles['td-body-wide'], isComingSoonView && styles['td-body-flush'])}>
          {subtab === 'profile' ? (
            <ProfileTab
              project={project}
              avatarSrc={avatarSrc}
              projectPhotoSrc={projectPhotoSrc}
              onPickAvatar={pickAvatar}
              onPickProjectPhoto={pickProjectPhoto}
              onSave={save}
              onDeleteProject={() => onDeleteProject(project.id)}
            />
          ) : null}
          {subtab !== 'profile' ? (
            <ProjectComingSoon subtitle={COMING_SOON_SUBTITLE[subtab] ?? 'Розділ у розробці.'} />
          ) : null}
        </div>
      </main>
    </div>
  );
}
