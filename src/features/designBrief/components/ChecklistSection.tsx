import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../designBrief.module.css';
import type { DesignBriefCheckItem } from '../types';

interface ChecklistSectionProps {
  checkItems: DesignBriefCheckItem[];
  onChange: (checkItems: DesignBriefCheckItem[]) => void;
}

export function ChecklistSection({ checkItems, onChange }: ChecklistSectionProps) {
  const done = checkItems.filter((item) => item.done).length;
  const hasItems = checkItems.length > 0;

  const updateOne = (id: string, patch: Partial<DesignBriefCheckItem>) => {
    onChange(checkItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onChange([
      ...checkItems,
      {
        id: `c${Date.now()}`,
        label: 'Нова деталь',
        done: false,
      },
    ]);
  };

  const head = (
    <div className={styles['db-drawer-block-head']}>
      <h3 className={styles['db-drawer-block-title']}>Важливі деталі</h3>
      {hasItems ? <span className={styles['db-drawer-block-meta']}>{done}/{checkItems.length}</span> : null}
    </div>
  );

  if (!hasItems) {
    return (
      <button
        type="button"
        className={cx(
          styles['db-drawer-block'],
          styles['db-drawer-block-checklist'],
          styles['db-drawer-block-checklist-empty'],
          styles['db-drawer-block-empty-hit'],
        )}
        onClick={addItem}
        aria-label="Додати важливі деталі"
      >
        <span className={styles['db-drawer-empty-t']}>
          {Icons.plus}
          Додати деталь
        </span>
      </button>
    );
  }

  return (
    <section className={cx(styles['db-drawer-block'], styles['db-drawer-block-checklist'])}>
      {head}
      <div className={styles['db-drawer-block-body']}>
        <ul className={styles['db-check-list']}>
          {checkItems.map((item) => (
            <li key={item.id} className={styles['db-check-row']}>
              <button
                type="button"
                className={cx(styles['db-check-box'], item.done && styles['db-check-box-on'])}
                aria-pressed={item.done}
                onClick={() => updateOne(item.id, { done: !item.done })}
              >
                {item.done ? Icons.check : null}
              </button>
              <input
                className={cx(styles['db-check-label'], item.done && styles['db-check-label-done'])}
                value={item.label}
                onChange={(e) => updateOne(item.id, { label: e.target.value })}
                aria-label="Важлива деталь"
              />
              <button
                type="button"
                className={styles['db-check-del']}
                aria-label="Видалити пункт"
                onClick={() => onChange(checkItems.filter((i) => i.id !== item.id))}
              >
                {Icons.trash}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles['db-detail-add']} onClick={addItem}>
          {Icons.plus}
          <span>Додати деталь</span>
        </button>
      </div>
    </section>
  );
}
