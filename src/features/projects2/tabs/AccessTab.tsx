import { cx } from '../../../shared/styles/cx';
import styles from '../projects2.module.css';
import type { Project } from '../types';

interface AccessTabProps {
  member: Project;
}

export function AccessTab({ member }: AccessTabProps) {
  const groups = [
    { title: 'Загальні', perms: [{ key: 'Доступ до CRM', value: `Усі ліди для ${member.role}`, on: true, level: 'admin' }, { key: 'Експорт даних', value: 'CSV / Excel / API', on: true, level: 'write' }] },
    { title: 'Фінанси', perms: [{ key: 'Перегляд балансу', value: 'Усі рахунки', on: true, level: 'read' }, { key: 'Затвердження >₴100K', value: 'Потрібен 2FA', on: false, level: 'lock' }] },
  ];

  return (
    <>
      {groups.map((group) => (
        <section key={group.title} className={styles['td-sect']}>
          <h3 className={styles['td-sect-t']}>{group.title}</h3>
          {group.perms.map((permission) => (
            <div key={permission.key} className={styles['acc-row']}>
              <div className={styles['acc-l']}><div className={styles['acc-k']}>{permission.key}</div><div className={styles['acc-v']}>{permission.value}</div></div>
              <span className={cx(styles['acc-tag'], styles[permission.level])}>{permission.level}</span>
              <button className={cx(styles.tog, permission.on && styles.on)} type="button"><span /></button>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
