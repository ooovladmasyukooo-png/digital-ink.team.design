import { useRef } from 'react';
import { Avatar } from '../../shared/components/Avatar';
import { Icon, Icons } from '../../shared/components/Icon';
import { Topbar } from '../../shared/components/Topbar';
import type { TopbarTab } from '../../shared/types/common';
import { cx } from '../../shared/styles/cx';
import { ProjectComingSoon } from './components/ProjectComingSoon';
import { ProfileTab } from './tabs/ProfileTab';
import styles from './projects.module.css';
import type { Project, ProjectPatch, ProjectSubtabId } from './types';

const projectShortName = (name: string) =>
  name
    .split(' ')
    .map((part, index) => (index === 0 ? `${part[0]}.` : part))
    .join(' ');

interface ProjectDetailProps {
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

export function ProjectDetail({
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
}: ProjectDetailProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const projectPhotoRef = useRef<HTMLInputElement>(null);
  const shortName = projectShortName(project.name);

  const tabs: TopbarTab<ProjectSubtabId>[] = [
    {
      id: 'profile',
      label: shortName,
      icon: <Avatar name={project.name} hue={project.hue} src={avatarSrc} />,
      menu: activeProjects.map((activeProject) => ({
        id: activeProject.id,
        label: activeProject.name,
        searchText: `${activeProject.name} ${activeProject.username} ${activeProject.role}`,
        icon: (
          <Avatar
            name={activeProject.name}
            hue={activeProject.hue}
            src={projectAvatars[activeProject.id]}
          />
        ),
        selected: activeProject.id === project.id,
      })),
      onMenuSelect: onSwitchProject,
    },
    { id: 'payouts', label: 'Виплати', icon: Icons.finance },
    { id: 'effectiveness', label: 'Ефективність', icon: Icons.analytics },
    { id: 'settings', label: 'Налаштування', icon: Icons.settings },
  ];

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

  const isComingSoonView = subtab === 'payouts' || subtab === 'effectiveness' || subtab === 'settings';

  return (
    <div className={styles['team-shell']}>
      <Topbar
        title={
          <button className={styles['back-icn']} onClick={onBack} title="Назад до списку" type="button">
            <Icon d={<path d="M19 12H5M12 19l-7-7 7-7" />} size={16} />
          </button>
        }
        tabs={tabs}
        activeTab={subtab}
        onTab={onSubtabChange}
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
          {subtab === 'payouts' ? <ProjectComingSoon subtitle="Розділ виплат та звітності у розробці." /> : null}
          {subtab === 'effectiveness' ? (
            <ProjectComingSoon subtitle="Метрики та аналітика ефективності у розробці." />
          ) : null}
          {subtab === 'settings' ? <ProjectComingSoon subtitle="Додаткові налаштування проєкту у розробці." /> : null}
        </div>
      </main>
    </div>
  );
}
