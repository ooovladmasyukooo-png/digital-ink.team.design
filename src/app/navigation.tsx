import type { SidebarNavEntry } from '../shared/types/common';
import { Icons } from '../shared/components/Icon';

export const sidebarNavigation: SidebarNavEntry[] = [
  { kind: 'link', id: 'dashboard', label: 'Дашборд', icon: Icons.dashboard },
  { kind: 'link', id: 'crm', label: 'CRM', icon: Icons.crm, badge: 227 },
  { kind: 'link', id: 'analytics', label: 'Аналітика', icon: Icons.analytics },
  { kind: 'divider', id: 'after-analytics' },
  { kind: 'link', id: 'projects', label: 'Проєкти', icon: Icons.projects },
  { kind: 'link', id: 'tasks', label: 'Задачі', icon: Icons.tasks },
  { kind: 'divider', id: 'after-tasks' },
  { kind: 'link', id: 'team', label: 'Команда', icon: Icons.team },
  { kind: 'link', id: 'finance', label: 'Фінанси', icon: Icons.finance },
];
