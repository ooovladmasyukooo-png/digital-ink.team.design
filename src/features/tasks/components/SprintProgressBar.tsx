import { cx } from '../../../shared/styles/cx';
import type { SprintProgress } from '../sprintProgress';
import styles from '../tasks.module.css';

interface SprintProgressBarProps {
  progress: SprintProgress;
  variant: 'header' | 'summary' | 'row';
  label?: string;
}

export function SprintProgressBar({ progress, variant, label }: SprintProgressBarProps) {
  const { done, total, percent } = progress;
  const empty = total === 0;
  const ariaLabel = empty
    ? 'Немає задач для відстеження прогресу'
    : `Виконано ${done} з ${total} (${percent}%)`;

  return (
    <div
      className={cx(styles['ts-sprint-progress'], styles[`ts-sprint-progress-${variant}`])}
      aria-label={label ?? ariaLabel}
    >
      {variant === 'summary' && label ? (
        <span className={styles['ts-sprint-progress-label']}>{label}</span>
      ) : null}
      <div className={styles['ts-sprint-progress-main']}>
        <div
          className={styles['ts-sprint-progress-track']}
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={total || 100}
          aria-label={ariaLabel}
        >
          <span
            className={styles['ts-sprint-progress-fill']}
            style={{ width: empty ? '0%' : `${percent}%` }}
          />
        </div>
        <span className={styles['ts-sprint-progress-meta']}>
          {empty ? '—' : `${done}/${total}`}
          {!empty ? <span className={styles['ts-sprint-progress-pct']}>{percent}%</span> : null}
        </span>
      </div>
    </div>
  );
}
