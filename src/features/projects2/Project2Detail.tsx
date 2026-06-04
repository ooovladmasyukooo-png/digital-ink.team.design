import { useRef } from 'react';
import { cx } from '../../shared/styles/cx';
import { Project2DetailHeader } from './components/Project2DetailHeader';
import { ProjectComingSoon } from './components/ProjectComingSoon';
import { ProfileTab } from './tabs/ProfileTab';
import { DesignBriefTab } from './tabs/DesignBriefTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { ProjectTasksTab } from './tabs/ProjectTasksTab';
import styles from './projects2.module.css';
import { normalizeTeamAssignments, teamMemberIds } from './projectTeam';
import type { Project, ProjectPatch, ProjectSubtabId } from './types';

const COMING_SOON_SUBTITLE: Partial<Record<ProjectSubtabId, string>> = {
  tasks: 'Задачі проєкту у розробці.',
  'daily-reports': 'Щоденна звітність у розробці.',
  bookings: 'Букінги у розробці.',
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
  onPatch: (projectId: string, patch: ProjectPatch) => void;
  onAvatarChange: (projectId: string, src: string) => void;
  onProjectPhotoChange: (projectId: string, src: string) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenTaskFullPage: (taskId: string) => void;
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
  onPatch,
  onAvatarChange,
  onProjectPhotoChange,
  onDeleteProject,
  onOpenTaskFullPage,
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
  const patch = (patchFields: ProjectPatch) => onPatch(project.id, patchFields);

  const isTasksView = subtab === 'tasks';
  const isDocumentsView = subtab === 'documents';
  const isDesignBriefView = subtab === 'design-brief';
  const isTasksLikeView = isTasksView || isDesignBriefView;
  const isDocWorkspaceView = isDocumentsView;
  const isWorkspaceView = isTasksLikeView || isDocWorkspaceView;
  const isComingSoonView = subtab !== 'profile' && !isWorkspaceView;
  const isFlushMain = isComingSoonView || isWorkspaceView;

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
        onPatch={(patchFields) => onPatch(project.id, patchFields)}
        onSave={save}
        onDeleteProject={() => onDeleteProject(project.id)}
      />
      <main
        className={cx(
          styles['team-main'],
          styles['team-main-full'],
          isFlushMain && styles['team-main-flush'],
          isDocWorkspaceView && styles['team-main-documents'],
        )}
      >
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarFile} />
        <input ref={projectPhotoRef} type="file" accept="image/*" className="sr-only" onChange={handleProjectPhotoFile} />
        <div
          className={cx(
            styles['td-body'],
            isTasksLikeView
              ? styles['td-body-tasks']
              : isDocWorkspaceView
                ? styles['td-body-documents']
                : styles['td-body-wide'],
            isComingSoonView && styles['td-body-flush'],
          )}
        >
          {subtab === 'profile' ? (
            <ProfileTab
              project={project}
              avatarSrc={avatarSrc}
              onPickAvatar={pickAvatar}
              onSave={save}
              onPatch={patch}
            />
          ) : null}
          {subtab === 'tasks' ? (
            <ProjectTasksTab
              projectId={project.id}
              projectTeamMemberIds={teamMemberIds(normalizeTeamAssignments(project))}
              onOpenTaskFullPage={onOpenTaskFullPage}
            />
          ) : null}
          {subtab === 'documents' ? <DocumentsTab projectId={project.id} /> : null}
          {subtab === 'design-brief' ? <DesignBriefTab projectId={project.id} /> : null}
          {isComingSoonView ? (
            <ProjectComingSoon subtitle={COMING_SOON_SUBTITLE[subtab] ?? 'Розділ у розробці.'} />
          ) : null}
        </div>
      </main>
    </div>
  );
}
