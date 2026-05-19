import { Chip } from '../../../shared/components/Chip';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects.module.css';
import type { Project } from '../types';

interface SettingsTabProps {
  member: Project;
}

export function SettingsTab({ member }: SettingsTabProps) {
  return (
    <>
      <section className={styles['td-sect']}>
        <h3 className={styles['td-sect-t']}>Сповіщення</h3>
        <div className={styles['acc-row']}><div className={styles['acc-l']}><div className={styles['acc-k']}>Email-сповіщення</div><div className={styles['acc-v']}>Угоди, виплати, нагадування для {member.email}</div></div><button className={cx(styles.tog, styles.on)} type="button"><span /></button></div>
        <div className={styles['acc-row']}><div className={styles['acc-l']}><div className={styles['acc-k']}>Push-сповіщення</div><div className={styles['acc-v']}>У браузері та на mobile</div></div><button className={cx(styles.tog, styles.on)} type="button"><span /></button></div>
      </section>
      <section className={styles['td-sect']}>
        <h3 className={styles['td-sect-t']}>Безпека</h3>
        <div className={styles['acc-row']}>
          <div className={styles['acc-l']}><div className={styles['acc-k']}>Двофакторна автентифікація</div><div className={styles['acc-v']}>Активна · Authenticator</div></div>
          <Chip tone="green" dot>Enabled</Chip>
          <button className="ghost-btn sm" type="button">Налаштувати</button>
        </div>
      </section>
      <section className={styles['td-sect']}>
        <h3 className={styles['td-sect-t']}>Зона небезпеки</h3>
        <div className={cx(styles['acc-row'], styles['danger-row'])}>
          <div className={styles['acc-l']}><div className={styles['acc-k']}>Заархівувати акаунт</div><div className={styles['acc-v']}>Доступ обмежиться, дані збережуться</div></div>
          <button className={styles['del-btn']} type="button">Заархівувати</button>
        </div>
      </section>
    </>
  );
}
