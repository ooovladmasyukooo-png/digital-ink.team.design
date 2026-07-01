import { formatTaskDeadline } from './dateDisplay';
import type { Sprint } from './sprints';

export function formatSprintPeriod(startDate: string, endDate: string): string {
  const start = formatTaskDeadline(startDate);
  const end = formatTaskDeadline(endDate);
  if (!start && !end) return '—';
  if (!start) return end;
  if (!end) return start;
  return `${start} — ${end}`;
}

export function formatSprintPeriodShort(sprint: Pick<Sprint, 'startDate' | 'endDate'>): string {
  return formatSprintPeriod(sprint.startDate, sprint.endDate);
}
