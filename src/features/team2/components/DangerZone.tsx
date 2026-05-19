import { useEffect, useState } from 'react';
import { cx } from '../../../shared/styles/cx';
import styles from '../team.module.css';

interface DangerZoneProps {
  memberName: string;
  onConfirmDelete: () => void;
}

export function DangerZone({ memberName, onConfirmDelete }: DangerZoneProps) {
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  useEffect(() => {
    setAwaitingConfirm(false);
  }, [memberName]);

  useEffect(() => {
    if (!awaitingConfirm) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAwaitingConfirm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [awaitingConfirm]);

  return (
    <section className={styles['td-sect']}>
      <div className={cx(styles['acc-row'], styles['danger-row'], awaitingConfirm && styles['danger-row-active'])}>
        <div className={styles['acc-l']}>
          <div className={styles['acc-k']}>{awaitingConfirm ? 'Підтвердіть видалення' : 'Видалити спеціаліста'}</div>
          <div className={styles['acc-v']}>
            {awaitingConfirm ? (
              <>
                Буде видалено профіль <strong className={styles['danger-name']}>{memberName}</strong>. Цю дію не можна скасувати.
              </>
            ) : (
              'Цю дію не можна скасувати'
            )}
          </div>
        </div>
        {!awaitingConfirm ? (
          <button className={styles['del-btn']} type="button" onClick={() => setAwaitingConfirm(true)}>
            Видалити
          </button>
        ) : (
          <div className={styles['danger-actions']}>
            <button className="ghost-btn sm" type="button" onClick={() => setAwaitingConfirm(false)}>
              Скасувати
            </button>
            <button
              className={styles['del-btn-confirm']}
              type="button"
              onClick={() => {
                onConfirmDelete();
                setAwaitingConfirm(false);
              }}
            >
              Так, видалити
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
