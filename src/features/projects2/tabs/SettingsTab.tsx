import { ProjectSettingsPanel } from '../components/ProjectSettingsPanel';
import styles from '../projects2.module.css';
import type { Project, ProjectPatch } from '../types';

interface SettingsTabProps {
  project: Project;
  onSave: (field: keyof ProjectPatch, value: string) => void;
  onPatch: (patch: ProjectPatch) => void;
  onDeleteProject: () => void;
}

export function SettingsTab({ project, onSave, onPatch, onDeleteProject }: SettingsTabProps) {
  return (
    <div className={styles['p2-settings']}>
      <ProjectSettingsPanel project={project} onSave={onSave} onPatch={onPatch} onDeleteProject={onDeleteProject} />
    </div>
  );
}
