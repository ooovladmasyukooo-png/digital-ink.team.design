import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { CrmPage } from '../features/crm/CrmPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FinancePage } from '../features/finance/FinancePage';
import type { ProjectSubtabId } from '../features/projects/types';
import { Projects2Page } from '../features/projects2/Projects2Page';
import { DesignBriefPage } from '../features/designBrief/DesignBriefPage';
import { TasksPage } from '../features/tasks/TasksPage';
import { buildTaskLink } from '../features/tasks/tasksPaths';
import type { TeamSubtabId } from '../features/team/types';
import { TeamPage } from '../features/team/TeamPage';
import type { FeatureId } from '../shared/types/common';
import { AppShell } from './AppShell';
import {
  parseLocation,
  pathForFeature,
  pathForProject2Profile,
  pathForTeamProfile,
} from './appPaths';

const SIDEBAR_TITLE_UK: Record<FeatureId, string> = {
  dashboard: 'Дашборд',
  crm: 'CRM',
  projects2: 'Проєкти',
  analytics: 'Аналітика',
  finance: 'Фінанси',
  team: 'Команда',
  tasks: 'Задачі',
  'design-brief': 'ТЗ дизайнеру',
};

const featurePages: Record<
  Exclude<FeatureId, 'team' | 'tasks' | 'projects2' | 'design-brief'>,
  ReactNode
> = {
  dashboard: <DashboardPage />,
  crm: <CrmPage />,
  analytics: <AnalyticsPage />,
  finance: <FinancePage />,
};

export function App() {
  const initial = parseLocation(window.location.pathname, window.location.search);
  const [active, setActive] = useState<FeatureId>(() => initial.feature);
  const [teamProfileId, setTeamProfileId] = useState<string | null>(() => initial.teamProfileId);
  const [teamSubtab, setTeamSubtab] = useState<TeamSubtabId>(() => initial.teamSubtab);
  const [project2ProfileId, setProject2ProfileId] = useState<string | null>(() => initial.project2ProfileId);
  const [project2Subtab, setProject2Subtab] = useState<ProjectSubtabId>(() => initial.project2Subtab);

  const syncFromWindow = useCallback(() => {
    const next = parseLocation(window.location.pathname, window.location.search);
    setActive(next.feature);
    setTeamProfileId(next.teamProfileId);
    setTeamSubtab(next.teamSubtab);
    setProject2ProfileId(next.project2ProfileId);
    setProject2Subtab(next.project2Subtab);
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', syncFromWindow);
    return () => window.removeEventListener('popstate', syncFromWindow);
  }, [syncFromWindow]);

  useEffect(() => {
    if (active === 'team' || active === 'projects2' || active === 'tasks' || active === 'design-brief') return;
    document.title = `${SIDEBAR_TITLE_UK[active]} · Aurora CRM`;
  }, [active]);

  const navigateFeature = useCallback((id: FeatureId) => {
    setActive(id);
    setTeamProfileId(null);
    setTeamSubtab('profile');
    setProject2ProfileId(null);
    setProject2Subtab('profile');
    window.history.pushState({}, '', pathForFeature(id));
    document.title = `${SIDEBAR_TITLE_UK[id]} · Aurora CRM`;
  }, []);

  const navigateTeamMember = useCallback(
    (memberId: string | null, replace = false, keepSubtab = false) => {
      setTeamProfileId(memberId);
      const nextSubtab = keepSubtab ? teamSubtab : 'profile';
      if (!keepSubtab) {
        setTeamSubtab('profile');
      }
      const url = memberId ? pathForTeamProfile(memberId, nextSubtab) : pathForFeature('team');
      const fn = replace ? window.history.replaceState : window.history.pushState;
      fn.call(window.history, {}, '', url);
    },
    [teamSubtab],
  );

  const navigateTeamSubtab = useCallback(
    (tab: TeamSubtabId) => {
      setTeamSubtab(tab);
      if (teamProfileId) {
        window.history.pushState({}, '', pathForTeamProfile(teamProfileId, tab));
      }
    },
    [teamProfileId],
  );

  const navigateProject2 = useCallback(
    (projectId: string | null, replace = false, keepSubtab = false) => {
      setProject2ProfileId(projectId);
      const nextSubtab = keepSubtab ? project2Subtab : 'profile';
      if (!keepSubtab) {
        setProject2Subtab('profile');
      }
      const url = projectId ? pathForProject2Profile(projectId, nextSubtab) : pathForFeature('projects2');
      const fn = replace ? window.history.replaceState : window.history.pushState;
      fn.call(window.history, {}, '', url);
    },
    [project2Subtab],
  );

  const navigateToTask = useCallback((taskId: string) => {
    setActive('tasks');
    setTeamProfileId(null);
    setTeamSubtab('profile');
    window.history.pushState({}, '', buildTaskLink(taskId));
  }, []);

  const navigateProject2Subtab = useCallback(
    (tab: ProjectSubtabId) => {
      setProject2Subtab(tab);
      if (project2ProfileId) {
        window.history.pushState({}, '', pathForProject2Profile(project2ProfileId, tab));
      }
    },
    [project2ProfileId],
  );

  return (
    <AppShell active={active} onNavigate={navigateFeature}>
      {active === 'team' ? (
        <TeamPage
          selectedMemberId={teamProfileId}
          teamSubtab={teamSubtab}
          onNavigateMember={navigateTeamMember}
          onNavigateSubtab={navigateTeamSubtab}
          onOpenTaskFullPage={navigateToTask}
        />
      ) : active === 'projects2' ? (
        <Projects2Page
          selectedProjectId={project2ProfileId}
          projectSubtab={project2Subtab}
          onNavigateProject={navigateProject2}
          onNavigateSubtab={navigateProject2Subtab}
        />
      ) : active === 'tasks' ? (
        <TasksPage />
      ) : active === 'design-brief' ? (
        <DesignBriefPage />
      ) : (
        featurePages[active]
      )}
    </AppShell>
  );
}
