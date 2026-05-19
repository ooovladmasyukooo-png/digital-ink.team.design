import type { ReactNode } from 'react';
import { Icons, Icon } from '../../../shared/components/Icon';
import styles from '../projects.module.css';
import type { Project, ProjectPatch } from '../types';
import { PROJECT_STYLE_OPTIONS } from '../roleOptions';
import { DangerZone } from '../components/DangerZone';
import { EditableField } from '../components/EditableField';
import { ProfileHero } from '../components/ProfileHero';

interface ProfileTabProps {
  project: Project;
  avatarSrc?: string | null;
  projectPhotoSrc?: string | null;
  onPickAvatar: () => void;
  onPickProjectPhoto: () => void;
  onSave: (field: keyof ProjectPatch, value: string) => void;
  onDeleteProject: () => void;
}

interface SelectFieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  fieldKey: keyof ProjectPatch;
  options: string[];
  onSave: (field: keyof ProjectPatch, value: string) => void;
}

function SelectField({ icon, label, value, fieldKey, options, onSave }: SelectFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles['field-l']}>
        <span className={styles['field-i']}>{icon}</span>
        <span className={styles['field-k']}>{label}</span>
      </div>
      <div className={`${styles['field-v-wrap']} ${styles['select-wrap']}`}>
        <select className={`${styles['field-in']} ${styles['field-select']}`} value={value} onChange={(event) => onSave(fieldKey, event.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <span className={styles['select-chev']}>{Icons.chevD}</span>
      </div>
    </div>
  );
}

export function ProfileTab({ project, avatarSrc, projectPhotoSrc, onPickAvatar, onPickProjectPhoto, onSave, onDeleteProject }: ProfileTabProps) {
  return (
    <>
      <ProfileHero project={project} avatarSrc={avatarSrc} projectPhotoSrc={projectPhotoSrc} onPickAvatar={onPickAvatar} onPickProjectPhoto={onPickProjectPhoto} />
      <section className={styles['td-sect']}>
        <h3 className={styles['td-sect-t']}>Основне</h3>
        <EditableField label="Назва" value={project.name} fieldKey="name" onSave={onSave} icon={<Icon d={<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>} size={15} />} />
        <EditableField label="Email" value={project.email} fieldKey="email" onSave={onSave} icon={Icons.mail} />
        <EditableField label="Телефон" value={project.phone} fieldKey="phone" onSave={onSave} icon={Icons.call} />
        <EditableField icon={Icons.calendar} label="Дата відкриття" value={project.birthday} fieldKey="birthday" onSave={onSave} date />
        <EditableField icon={<Icon d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></>} size={15} />} label="Місто" value={project.city} fieldKey="city" onSave={onSave} />
        <EditableField icon={Icons.spark} label="Ціль" value={project.dream} fieldKey="dream" onSave={onSave} multiline />
        <EditableField icon={Icons.team} label="Нотатки" value={project.hobby} fieldKey="hobby" onSave={onSave} multiline />
        <EditableField label="Instagram" value={project.username} fieldKey="username" onSave={onSave} icon={<Icon d={<><path d="M4 4h16v16H4z" /><path d="m9 9 6 6M15 9l-6 6" /></>} size={15} />} />
        <EditableField icon={<Icon d={<><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 8h20" /></>} size={15} />} label="Telegram" value={project.telegram} fieldKey="telegram" onSave={onSave} />
      </section>
      <section className={styles['td-sect']}>
        <h3 className={styles['td-sect-t']}>Студія</h3>
        <EditableField icon={Icons.calendar} label="У мережі з" value={project.joined} fieldKey="joined" onSave={onSave} date />
        <SelectField icon={Icons.briefcase} label="Стиль" value={project.role} fieldKey="role" options={PROJECT_STYLE_OPTIONS} onSave={onSave} />
        <EditableField icon={<Icon d={<><path d="M4 4h16v16H4z" /><path d="M8 8h8v8H8z" /></>} size={15} />} label="Telegram ID" value={project.telegramId} fieldKey="telegramId" onSave={onSave} />
        <EditableField icon={Icons.briefcase} label="Умови" value={project.conditions} fieldKey="conditions" onSave={onSave} multiline />
      </section>
      <DangerZone projectName={project.name} onConfirmDelete={onDeleteProject} />
    </>
  );
}
