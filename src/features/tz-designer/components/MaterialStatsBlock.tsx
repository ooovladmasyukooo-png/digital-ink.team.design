import { cx } from '../../../shared/styles/cx';
import { formatMaterialConversion } from '../materialOptions';
import type { ReferralMaterialStats } from '../types';
import styles from '../tzDesigner.module.css';

interface MaterialStatsBlockProps {
  stats: ReferralMaterialStats;
  variant?: 'drawer' | 'inline';
}

const STAT_ITEMS: { key: keyof ReferralMaterialStats; label: string }[] = [
  { key: 'partnersUsed', label: 'Партнери' },
  { key: 'views', label: 'Перегляди' },
  { key: 'linkClicks', label: 'Кліки' },
  { key: 'joined', label: 'Приєднались' },
];

export function MaterialStatsBlock({ stats, variant = 'drawer' }: MaterialStatsBlockProps) {
  const conversion = formatMaterialConversion(stats);

  return (
    <section
      className={cx(
        styles['material-stats'],
        variant === 'inline' && styles['material-stats-inline'],
      )}
      aria-label="Статистика матеріалу"
    >
      <div className={styles['material-stats-head']}>
        <span className={styles['material-stats-title']}>Статистика</span>
        <span className={styles['material-stats-conv']}>
          <span className={styles['material-stats-conv-k']}>Конверсія</span>
          <span className={styles['material-stats-conv-v']}>{conversion}</span>
        </span>
      </div>
      <div className={styles['material-stats-grid']}>
        {STAT_ITEMS.map(({ key, label }) => (
          <div key={key} className={styles['material-stat']}>
            <span className={styles['material-stat-k']}>{label}</span>
            <span className={cx(styles['material-stat-v'], 'mono')}>{stats[key]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
