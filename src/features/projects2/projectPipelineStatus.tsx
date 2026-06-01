import { Chip } from '../../shared/components/Chip';
import { cx } from '../../shared/styles/cx';
import type { Tone } from '../../shared/types/common';
import styles from './projects2.module.css';

export const PROJECT_PIPELINE_STATUS_GROUPS = [
  {
    label: 'To-do',
    statuses: ['Draft', 'Waiting for payment'],
  },
  {
    label: 'In progress',
    statuses: ['Start', 'Active', 'Pause'],
  },
  {
    label: 'Complete',
    statuses: ['Temporarily stopped', 'Stopped working'],
  },
] as const;

export const PROJECT_PIPELINE_STATUS_OPTIONS = [
  'Draft',
  'Waiting for payment',
  'Start',
  'Active',
  'Pause',
  'Temporarily stopped',
  'Stopped working',
] as const;

export type ProjectPipelineStatus = (typeof PROJECT_PIPELINE_STATUS_OPTIONS)[number];

const PIPELINE_STATUS_META: Record<ProjectPipelineStatus, { tone: Tone }> = {
  Draft: { tone: 'gray' },
  'Waiting for payment': { tone: 'gray' },
  Start: { tone: 'amber' },
  Active: { tone: 'green' },
  Pause: { tone: 'orange' },
  'Temporarily stopped': { tone: 'purple' },
  'Stopped working': { tone: 'red' },
};

const LEGACY_STATUS_MAP: Record<string, ProjectPipelineStatus> = {
  Draft: 'Draft',
  'Waiting for payment': 'Waiting for payment',
  Start: 'Start',
  Active: 'Active',
  Pause: 'Pause',
  'Temporarily stopped': 'Temporarily stopped',
  'Stopped working': 'Stopped working',
  Підготовка: 'Draft',
  Активний: 'Active',
  'На паузі': 'Pause',
  Завершений: 'Temporarily stopped',
  Архів: 'Stopped working',
};

export function normalizePipelineStatus(value: string): ProjectPipelineStatus {
  return LEGACY_STATUS_MAP[value] ?? 'Active';
}

export function stepPipelineStatus(
  current: ProjectPipelineStatus,
  direction: 'prev' | 'next',
): ProjectPipelineStatus {
  const index = PROJECT_PIPELINE_STATUS_OPTIONS.indexOf(current);
  const safeIndex = index >= 0 ? index : PROJECT_PIPELINE_STATUS_OPTIONS.indexOf('Active');
  const delta = direction === 'next' ? 1 : -1;
  const next =
    (safeIndex + delta + PROJECT_PIPELINE_STATUS_OPTIONS.length) % PROJECT_PIPELINE_STATUS_OPTIONS.length;
  return PROJECT_PIPELINE_STATUS_OPTIONS[next];
}

export function pipelineStatusTone(status: ProjectPipelineStatus): Tone {
  return PIPELINE_STATUS_META[status].tone;
}

export function PipelineStatusChip({
  status,
  size = 'md',
}: {
  status: ProjectPipelineStatus;
  size?: 'md' | 'lg' | 'compact';
}) {
  const tone = pipelineStatusTone(status);
  return (
    <span
      className={cx(
        size === 'lg' && styles['p2-metric-chip-lg'],
        size === 'compact' && styles['p2-metric-chip-compact'],
      )}
    >
      <Chip tone={tone} dot>
        {status}
      </Chip>
    </span>
  );
}
