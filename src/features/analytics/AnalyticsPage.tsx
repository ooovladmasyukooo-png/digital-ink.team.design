import { Icons } from '../../shared/components/Icon';
import { Topbar } from '../../shared/components/Topbar';
import { cx } from '../../shared/styles/cx';
import { channels, metrics, weeklyBars } from './data';
import styles from './analytics.module.css';

interface SparkProps {
  data: number[];
  h?: number;
  w?: number;
  color?: string;
}

function Spark({ data, h = 60, w = 220, color = '#ef4444' }: SparkProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const step = w / (data.length - 1);
  const normalize = (value: number) => h - ((value - min) / (max - min || 1)) * (h - 6) - 3;
  const points = data.map((value, index) => `${index * step},${normalize(value)}`).join(' ');
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={styles.spark}>
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function AnalyticsPage() {
  const maxBar = Math.max(...weeklyBars.map((bar) => bar.value));
  const total = channels.reduce((sum, channel) => sum + channel.value, 0);

  return (
    <div className="page-shell">
      <Topbar
        title="Аналітика"
        subtitle="Останні 30 днів · реальний час"
        right={
          <div className="seg">
            <button type="button">7d</button>
            <button className="on" type="button">30d</button>
            <button type="button">90d</button>
            <button type="button">Рік</button>
          </div>
        }
      />
      <div className="page">
        <div className={styles.stats}>
          {metrics.map((metric) => (
            <div key={metric.label} className={cx('card', styles['stat-card'])}>
              <div className={styles.stat}>
                <div className={styles['stat-label']}>{metric.label}</div>
                <div className={styles['stat-row']}>
                  <div className={styles['stat-value']}>{metric.value}</div>
                  <span className={cx(styles['stat-delta'], metric.up ? styles.up : styles.down)}>
                    {metric.up ? Icons.arrowU : Icons.arrowD}
                    {metric.delta}
                  </span>
                </div>
                <div className={styles['stat-foot']}>{metric.foot}</div>
              </div>
              <Spark data={metric.data} color={metric.color} />
            </div>
          ))}
        </div>

        <div className={styles['an-grid']}>
          <div className={cx('card', styles['big-chart'])}>
            <div className="card-h2">
              <div>
                <div className="card-t">Виручка по тижнях</div>
                <div className="card-sub">Травень 2026 · ₴1 840 000 закрито</div>
              </div>
            </div>
            <div className={styles.bars}>
              {weeklyBars.map((bar) => (
                <div key={bar.label} className={styles['bar-col']}>
                  <div className={styles['bar-stack']}>
                    <div className={cx(styles.bar, styles['bar-forecast'])} style={{ height: `${(bar.value * 1.18 / maxBar) * 59}%` }} />
                    <div className={cx(styles.bar, styles['bar-real'])} style={{ height: `${(bar.value / maxBar) * 59}%` }} />
                  </div>
                  <div className={styles['bar-lab']}>{bar.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h2">
              <div>
                <div className="card-t">Джерела лідів</div>
                <div className="card-sub">1 248 за 30 днів</div>
              </div>
            </div>
            <ul className={cx(styles['legend-list'], styles['channel-list'])}>
              {channels.map((channel) => (
                <li key={channel.key}>
                  <i className={styles['lg-square']} style={{ background: channel.color }} />
                  <span className={styles['lg-k']}>{channel.key}</span>
                  <span className={cx(styles['lg-v'], 'mono')}>{Math.round((channel.value / total) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
