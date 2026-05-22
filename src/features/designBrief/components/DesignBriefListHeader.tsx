import { Icons } from '../../../shared/components/Icon';
import styles from '../designBrief.module.css';

interface DesignBriefListHeaderProps {
  count: number;
  onCreate: () => void;
}

export function DesignBriefListHeader({ count, onCreate }: DesignBriefListHeaderProps) {
  return (
    <div className={styles['db-design-brief-header']}>
      <div className={styles['db-design-brief-header-main']}>
        <div className={styles['db-design-brief-header-title-row']}>
          <h1 className={styles['db-design-brief-header-title']}>ТЗ дизайнеру</h1>
          <span className={styles['db-design-brief-header-count']}>{count}</span>
        </div>
      </div>
      <div className={styles['db-design-brief-header-action']}>
        <button className="red-out-btn" type="button" onClick={onCreate}>
          {Icons.plus} Нове ТЗ
        </button>
      </div>
    </div>
  );
}
