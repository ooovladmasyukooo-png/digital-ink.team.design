import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../tasks.module.css';
import type { TaskCheckItem } from '../types';

interface ChecklistSectionProps {
  checkItems: TaskCheckItem[];
  onChange: (checkItems: TaskCheckItem[]) => void;
}

export function ChecklistSection({ checkItems, onChange }: ChecklistSectionProps) {
  const done = checkItems.filter((item) => item.done).length;
  const hasItems = checkItems.length > 0;

  const updateOne = (id: string, patch: Partial<TaskCheckItem>) => {
    onChange(checkItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onChange([
      ...checkItems,
      {
        id: `c${Date.now()}`,
        label: 'Новий пункт',
        done: false,
      },
    ]);
  };

  const head = (
    <div className={styles['ts-drawer-block-head']}>
      <h3 className={styles['ts-drawer-block-title']}>Чек-ліст</h3>
      {hasItems ? <span className={styles['ts-drawer-block-meta']}>{done}/{checkItems.length}</span> : null}
    </div>
  );

  if (!hasItems) {
    return (
      <button
        type="button"
        className={cx(
          styles['ts-drawer-block'],
          styles['ts-drawer-block-checklist'],
          styles['ts-drawer-block-checklist-empty'],
          styles['ts-drawer-block-empty-hit'],
        )}
        onClick={addItem}
        aria-label="Додати чек-ліст"
      >
        <span className={styles['ts-drawer-empty-t']}>
          {Icons.plus}
          Додати чек-ліст
        </span>
      </button>
    );
  }

  return (
    <section className={cx(styles['ts-drawer-block'], styles['ts-drawer-block-checklist'])}>
      {head}
      <div className={styles['ts-drawer-block-body']}>
        <ul className={styles['ts-check-list']}>
          {checkItems.map((item) => (
            <li key={item.id} className={styles['ts-check-row']}>
              <button
                type="button"
                className={cx(styles['ts-check-box'], item.done && styles['ts-check-box-on'])}
                aria-pressed={item.done}
                onClick={() => updateOne(item.id, { done: !item.done })}
              >
                {item.done ? Icons.check : null}
              </button>
              <input
                className={cx(styles['ts-check-label'], item.done && styles['ts-check-label-done'])}
                value={item.label}
                onChange={(e) => updateOne(item.id, { label: e.target.value })}
                aria-label="Пункт чек-лісту"
              />
              <button
                type="button"
                className={styles['ts-check-del']}
                aria-label="Видалити пункт"
                onClick={() => onChange(checkItems.filter((i) => i.id !== item.id))}
              >
                {Icons.trash}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles['ts-detail-add']} onClick={addItem}>
          {Icons.plus}
          <span>Додати пункт</span>
        </button>
      </div>
    </section>
  );
}
