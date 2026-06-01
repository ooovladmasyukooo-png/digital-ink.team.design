import { Icons } from '../../shared/components/Icon';
import { Chip } from '../../shared/components/Chip';
import { cx } from '../../shared/styles/cx';
import type { Tone } from '../../shared/types/common';
import type { TaskPickerItem } from '../tasks/components/TaskPickerPopover';
import taskStyles from '../tasks/tasks.module.css';
import styles from './projects2.module.css';

export const PROJECT_CHURN_RISK_LEVELS = [
  'Very low',
  'Low',
  'Medium',
  'High',
  'Critical',
] as const;

export type ProjectChurnRiskLevel = (typeof PROJECT_CHURN_RISK_LEVELS)[number];

export const PROJECT_CHURN_RISK_META: Record<ProjectChurnRiskLevel, { chipTone: Tone }> = {
  'Very low': { chipTone: 'green' },
  Low: { chipTone: 'gray' },
  Medium: { chipTone: 'blue' },
  High: { chipTone: 'amber' },
  Critical: { chipTone: 'red' },
};

const LEGACY_CHURN_MAP: Record<string, ProjectChurnRiskLevel> = {
  'Дуже низький': 'Very low',
  'Very low': 'Very low',
  'Низький': 'Low',
  Low: 'Low',
  'Середній': 'Medium',
  Medium: 'Medium',
  'Високий': 'High',
  High: 'High',
  'Критичний': 'Critical',
  Critical: 'Critical',
};

export function normalizeChurnRisk(value: string): ProjectChurnRiskLevel {
  return LEGACY_CHURN_MAP[value] ?? 'Medium';
}

export function stepChurnRisk(current: ProjectChurnRiskLevel, direction: 'prev' | 'next'): ProjectChurnRiskLevel {
  const index = PROJECT_CHURN_RISK_LEVELS.indexOf(current);
  const safeIndex = index >= 0 ? index : PROJECT_CHURN_RISK_LEVELS.indexOf('Medium');
  const delta = direction === 'next' ? 1 : -1;
  const next = (safeIndex + delta + PROJECT_CHURN_RISK_LEVELS.length) % PROJECT_CHURN_RISK_LEVELS.length;
  return PROJECT_CHURN_RISK_LEVELS[next];
}

export function ChurnRiskChip({
  level,
  size = 'md',
}: {
  level: ProjectChurnRiskLevel;
  size?: 'md' | 'lg' | 'compact';
}) {
  const meta = PROJECT_CHURN_RISK_META[level];
  return (
    <span
      className={cx(
        size === 'lg' && styles['p2-metric-chip-lg'],
        size === 'compact' && styles['p2-metric-chip-compact'],
      )}
    >
      <Chip tone={meta.chipTone}>
        <span className={taskStyles['ts-pri-flag']} aria-hidden>
          {Icons.flag}
        </span>
        {level}
      </Chip>
    </span>
  );
}

export function churnRiskPickerItems(current: ProjectChurnRiskLevel): TaskPickerItem[] {
  return PROJECT_CHURN_RISK_LEVELS.map((level) => ({
    id: level,
    selected: level === current,
    searchText: level,
    label: <ChurnRiskChip level={level} />,
  }));
}
