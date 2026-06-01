import { DangerZone } from './DangerZone';
import { ProjectSettingsEditor } from './ProjectSettingsEditor';
import type { Project, ProjectPatch } from '../types';

interface ProjectSettingsPanelProps {
  project: Project;
  onSave: (field: keyof ProjectPatch, value: string) => void;
  onPatch: (patch: ProjectPatch) => void;
  onDeleteProject: () => void;
}

export function ProjectSettingsPanel({ project, onSave, onPatch, onDeleteProject }: ProjectSettingsPanelProps) {
  return (
    <>
      <ProjectSettingsEditor project={project} onSave={onSave} onPatch={onPatch} />
      <DangerZone projectName={project.name} onConfirmDelete={onDeleteProject} />
    </>
  );
}
