import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { CrmPage } from '../features/crm/CrmPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FinancePage } from '../features/finance/FinancePage';
import { ProjectsPage } from '../features/projects/ProjectsPage';
import type { TeamSubtabId } from '../features/team/types';
import { TasksPage } from '../features/tasks/TasksPage';
import { TeamPage } from '../features/team/TeamPage';
import type { FeatureId } from '../shared/types/common';
import { AppShell } from './AppShell';
import { parseLocation, pathForFeature, pathForTeamProfile } from './appPaths';

const SIDEBAR_TITLE_UK: Record<FeatureId, string> = {
  dashboard: 'Дашборд',
  crm: 'CRM',
  projects: 'Проєкти',
  analytics: 'Аналітика',
  finance: 'Фінанси',
  team: 'Команда',
  tasks: 'Задачі',
};

const featurePages: Record<Exclude<FeatureId, 'team' | 'tasks'>, ReactNode> = {
  dashboard: <DashboardPage />,
  crm: <CrmPage />,
  projects: <ProjectsPage />,
  analytics: <AnalyticsPage />,
  finance: <FinancePage />,
};

export function App() {
  const initial = parseLocation(window.location.pathname, window.location.search);
  const [active, setActive] = useState<FeatureId>(() => initial.feature);
  const [teamProfileId, setTeamProfileId] = useState<string | null>(() => initial.teamProfileId);
  const [teamSubtab, setTeamSubtab] = useState<TeamSubtabId>(() => initial.teamSubtab);

  const syncFromWindow = useCallback(() => {
    const next = parseLocation(window.location.pathname, window.location.search);
    setActive(next.feature);
    setTeamProfileId(next.teamProfileId);
    setTeamSubtab(next.teamSubtab);
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', syncFromWindow);
    return () => window.removeEventListener('popstate', syncFromWindow);
  }, [syncFromWindow]);

  useEffect(() => {
    if (active === 'team') return;
    document.title =
      active === 'tasks'
        ? 'Задачі · Aurora CRM'
        : `${SIDEBAR_TITLE_UK[active]} · Aurora CRM`;
  }, [active]);

  const navigateFeature = useCallback((id: FeatureId) => {
    setActive(id);
    setTeamProfileId(null);
    setTeamSubtab('profile');
    window.history.pushState({}, '', pathForFeature(id));
    document.title = `${SIDEBAR_TITLE_UK[id]} · Aurora CRM`;
  }, []);

  const navigateTeamMember = useCallback((memberId: string | null, replace = false) => {
    setTeamProfileId(memberId);
    setTeamSubtab('profile');
    const url = memberId ? pathForTeamProfile(memberId, 'profile') : pathForFeature('team');
    const fn = replace ? window.history.replaceState : window.history.pushState;
    fn.call(window.history, {}, '', url);
  }, []);

  const navigateTeamSubtab = useCallback(
    (tab: TeamSubtabId) => {
      setTeamSubtab(tab);
      if (teamProfileId) {
        window.history.pushState({}, '', pathForTeamProfile(teamProfileId, tab));
      }
    },
    [teamProfileId],
  );

  return (
    <AppShell active={active} onNavigate={navigateFeature}>
      {active === 'team' ? (
        <TeamPage
          selectedMemberId={teamProfileId}
          teamSubtab={teamSubtab}
          onNavigateMember={navigateTeamMember}
          onNavigateSubtab={navigateTeamSubtab}
        />
      ) : active === 'tasks' ? (
        <TasksPage />
      ) : (
        featurePages[active]
      )}
    </AppShell>
  );
}
