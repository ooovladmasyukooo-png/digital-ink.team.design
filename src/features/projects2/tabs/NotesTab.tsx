import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects2.module.css';
import type { Project } from '../types';

interface NotesTabProps {
  member: Project;
}

export function NotesTab({ member }: NotesTabProps) {
  const notes = [
    { author: 'Дарія', when: '14.05 · 18:22', text: `${member.name} просить підготувати презентацію для Mansour до п'ятниці. Бюджет до ₴250K.` },
    { author: 'Ярослав', when: '12.05 · 09:11', text: 'Дзвонив клієнт із Volkov - переходять на партнерську модель. Треба переписати договір.' },
  ];

  return (
    <section className={styles['td-sect']}>
      <div className={styles['td-sect-h']}>
        <h3 className={styles['td-sect-t']}>Нотатки · {notes.length}</h3>
        <button className="red-out-btn" type="button">{Icons.plus} Нова нотатка</button>
      </div>
      <div className={styles['note-list']}>
        {notes.map((note) => (
          <div key={`${note.author}-${note.when}`} className={styles.note}>
            <div className={styles['note-h']}><div className={styles['note-a']}>{note.author}</div><div className={cx(styles['note-w'], 'mono')}>{note.when}</div></div>
            <div className={styles['note-b']}>{note.text}</div>
          </div>
        ))}
        <textarea className={styles['note-input']} placeholder="Додати нотатку..." />
      </div>
    </section>
  );
}
