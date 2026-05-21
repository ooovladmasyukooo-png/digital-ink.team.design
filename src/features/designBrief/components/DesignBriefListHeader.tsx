import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import teamStyles from '../../team/team.module.css';
import styles from '../designBrief.module.css';

interface DesignBriefListHeaderProps {
  count: number;
  onCreate: () => void;
}

export function DesignBriefListHeader({ count, onCreate }: DesignBriefListHeaderProps) {
  return (
    <header
      className={cx(
        teamStyles['team-stacked-header'],
        teamStyles['team-stacked-header--list'],
        styles['db-design-brief-header'],
      )}
    >
      <div className={teamStyles['team-list-head']}>
        <div className={teamStyles['team-list-title-row']}>
          <h1 className={teamStyles['team-list-title']}>ТЗ дизайнеру</h1>
          <span className={teamStyles['team-list-count']}>{count}</span>
        </div>
        <p className={teamStyles['team-list-sub']}>Брифи та задачі для дизайн-команди</p>
      </div>
      <div className={teamStyles['team-list-head-action']}>
        <button className="red-out-btn" type="button" onClick={onCreate}>
          {Icons.plus} Нове ТЗ
        </button>
      </div>
    </header>
  );
}
