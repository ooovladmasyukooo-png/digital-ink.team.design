import { useEffect, useState } from 'react';
import { projects as projectCatalog } from './data';
import { normalizeLinkOrder } from './projectLinks';
import { normalizeTeamAssignments } from './projectTeam';
import { Project2Detail } from './Project2Detail';
import { Project2List } from './Project2List';
import type { ProjectPatch, ProjectSubtabId } from './types';

const SUBTAB_DOC_TITLE: Record<ProjectSubtabId, string> = {
  profile: 'Головна',
  tasks: 'Задачі',
  documents: 'Документи',
  'daily-reports': 'Звітність',
  bookings: 'Букінги',
  'design-brief': 'ТЗ дизайнеру',
};

const COMING_SOON_SUBTITLE: Partial<Record<ProjectSubtabId, string>> = {
  tasks: 'Задачі проєкту у розробці.',
  'daily-reports': 'Щоденна звітність у розробці.',
  bookings: 'Букінги у розробці.',
};

interface Projects2PageProps {
  selectedProjectId: string | null;
  projectSubtab: ProjectSubtabId;
  onNavigateProject: (projectId: string | null, replaceHistory?: boolean, keepSubtab?: boolean) => void;
  onNavigateSubtab: (tab: ProjectSubtabId) => void;
  onOpenTaskFullPage: (taskId: string) => void;
}

export function Projects2Page({
  selectedProjectId,
  projectSubtab,
  onNavigateProject,
  onNavigateSubtab,
  onOpenTaskFullPage,
}: Projects2PageProps) {
  const [removedProjectIds, setRemovedProjectIds] = useState<Set<string>>(() => new Set());
  const [overrides, setOverrides] = useState<Record<string, ProjectPatch>>({});
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [projectPhotos, setProjectPhotos] = useState<Record<string, string>>({});

  const items = projectCatalog
    .filter((project) => !removedProjectIds.has(project.id))
    .map((project) => {
      const merged = { ...project, ...(overrides[project.id] ?? {}) };
      return {
        ...merged,
        teamAssignments: normalizeTeamAssignments(merged),
        settingExtras: merged.settingExtras ?? [],
        customLinks: merged.customLinks ?? [],
        linkOrder: normalizeLinkOrder(merged.linkOrder, merged.customLinks ?? []),
      };
    });
  const selectedProject = selectedProjectId
    ? items.find((project) => project.id === selectedProjectId) ?? null
    : null;

  useEffect(() => {
    if (!selectedProjectId) return;
    const known = projectCatalog.some((project) => project.id === selectedProjectId);
    const visible = known && !removedProjectIds.has(selectedProjectId);
    if (visible) return;
    onNavigateProject(null, true);
  }, [selectedProjectId, removedProjectIds, onNavigateProject]);

  useEffect(() => {
    if (!selectedProject) {
      document.title = 'Проєкти · Aurora CRM';
      return;
    }
    const tabPart = SUBTAB_DOC_TITLE[projectSubtab];
    document.title =
      projectSubtab === 'profile'
        ? `${selectedProject.name} · Головна · Проєкти · Aurora CRM`
        : `${tabPart} · ${selectedProject.name} · Проєкти · Aurora CRM`;
  }, [selectedProject, projectSubtab]);

  const saveField = (projectId: string, field: keyof ProjectPatch, value: string) => {
    setOverrides((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] ?? {}),
        [field]: value,
      },
    }));
  };

  const patchProject = (projectId: string, patch: ProjectPatch) => {
    setOverrides((current) => {
      const prev = current[projectId] ?? {};
      const base = projectCatalog.find((p) => p.id === projectId);
      const mergedQuickLinks = patch.quickLinks
        ? {
            ...(base?.quickLinks ?? {}),
            ...(prev.quickLinks ?? {}),
            ...patch.quickLinks,
          }
        : undefined;
      const mergedSettingExtras = patch.settingExtras ?? prev.settingExtras ?? base?.settingExtras;
      const mergedCustomLinks = patch.customLinks ?? prev.customLinks ?? base?.customLinks;
      const mergedLinkOrder = patch.linkOrder ?? prev.linkOrder ?? base?.linkOrder;
      return {
        ...current,
        [projectId]: {
          ...prev,
          ...patch,
          ...(mergedQuickLinks ? { quickLinks: mergedQuickLinks } : {}),
          ...(mergedSettingExtras ? { settingExtras: mergedSettingExtras } : {}),
          ...(mergedCustomLinks ? { customLinks: mergedCustomLinks } : {}),
          ...(mergedLinkOrder ? { linkOrder: mergedLinkOrder } : {}),
        },
      };
    });
  };

  const deleteProject = (projectId: string) => {
    setRemovedProjectIds((current) => new Set(current).add(projectId));
    onNavigateProject(null);
  };

  if (!selectedProject) {
    return (
      <Project2List
        projects={items}
        onSelect={(id) => onNavigateProject(id)}
        onMoveProject={(projectId, status) => patchProject(projectId, { pipelineStatus: status })}
      />
    );
  }

  return (
    <Project2Detail
      project={selectedProject}
      activeProjects={items.filter((item) => item.status === 'active')}
      projectAvatars={avatars}
      subtab={projectSubtab}
      avatarSrc={avatars[selectedProject.id]}
      projectPhotoSrc={projectPhotos[selectedProject.id]}
      onBack={() => onNavigateProject(null)}
      onSubtabChange={onNavigateSubtab}
      onSwitchProject={(projectId) => onNavigateProject(projectId, false, true)}
      onSave={saveField}
      onPatch={patchProject}
      onAvatarChange={(projectId, src) => setAvatars((current) => ({ ...current, [projectId]: src }))}
      onProjectPhotoChange={(projectId, src) =>
        setProjectPhotos((current) => ({ ...current, [projectId]: src }))
      }
      onDeleteProject={deleteProject}
      onOpenTaskFullPage={onOpenTaskFullPage}
    />
  );
}
