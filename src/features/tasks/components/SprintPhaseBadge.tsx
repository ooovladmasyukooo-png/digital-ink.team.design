import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { SPRINT_PHASE_BADGE_LABELS } from '../sprints';
import styles from '../tasks.module.css';
import type { SprintPhaseId } from '../types';

const PHASE_TONE: Record<SprintPhaseId, string> = {
  active: 'blue',
  queued: 'gray',
  completed: 'green',
};

interface SprintPhaseBadgeProps {
  phase: SprintPhaseId;
  size?: 'sm' | 'md';
}

export function SprintPhaseBadge({ phase, size = 'sm' }: SprintPhaseBadgeProps) {
  const tone = PHASE_TONE[phase];
  return (
    <span
      className={cx(
        styles['ts-status'],
        size === 'md' ? styles['ts-status-md'] : styles['ts-status-sm'],
        styles[`ts-status-${tone}`],
      )}
    >
      <span className={styles['ts-status-i']} aria-hidden>
        {Icons.repeat}
      </span>
      {SPRINT_PHASE_BADGE_LABELS[phase]}
    </span>
  );
}
