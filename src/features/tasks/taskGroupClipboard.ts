import { projects } from '../projects2/data';
import { DATE_GROUP_LABELS, defaultDeadlineForGroup } from './dateGroups';
import { projectById } from './taskOptions';
import type { DateGroupId, Task } from './types';

const PERSONAL_SECTION = 'Особисті';

function formatDayMonthFromIso(iso: string): string {
  const match = iso.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!match) return '';
  return `${match[2]}.${match[1]}`;
}

function headerForGroup(groupId: DateGroupId, now = new Date()): string {
  switch (groupId) {
    case 'overdue':
      return 'Задачі — прострочені';
    case 'none':
      return 'Задачі без дедлайну';
    case 'today':
    case 'tomorrow': {
      const iso = defaultDeadlineForGroup(groupId, now);
      const dateSuffix = iso ? ` (${formatDayMonthFromIso(iso)})` : '';
      return `Задачі на ${DATE_GROUP_LABELS[groupId].toLowerCase()}${dateSuffix}`;
    }
    default:
      return `Задачі на ${DATE_GROUP_LABELS[groupId].toLowerCase()}`;
  }
}

function groupTasksByProjectForClipboard(tasks: Task[]): { title: string; tasks: Task[] }[] {
  const personal: Task[] = [];
  const byProject = new Map<string, Task[]>();

  for (const task of tasks) {
    if (!task.projectId) {
      personal.push(task);
      continue;
    }
    const list = byProject.get(task.projectId) ?? [];
    list.push(task);
    byProject.set(task.projectId, list);
  }

  const sections: { title: string; tasks: Task[] }[] = [];
  if (personal.length > 0) {
    sections.push({ title: PERSONAL_SECTION, tasks: personal });
  }

  const orderedIds = [
    ...projects.map((p) => p.id),
    ...[...byProject.keys()].filter((id) => !projects.some((p) => p.id === id)),
  ];

  const seen = new Set<string>();
  for (const id of orderedIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const list = byProject.get(id);
    if (!list?.length) continue;
    sections.push({
      title: projectById[id]?.name ?? id,
      tasks: list,
    });
  }

  return sections;
}

export function formatDateGroupTasksClipboard(groupId: DateGroupId, tasks: Task[]): string {
  const lines: string[] = [headerForGroup(groupId), ''];
  const sections = groupTasksByProjectForClipboard(tasks);

  if (sections.length === 0) return lines.join('\n').trimEnd();

  sections.forEach((section, index) => {
    lines.push(section.title);
    for (const task of section.tasks) {
      lines.push(`•${task.title}`);
    }
    if (index < sections.length - 1) lines.push('');
  });

  return lines.join('\n');
}
