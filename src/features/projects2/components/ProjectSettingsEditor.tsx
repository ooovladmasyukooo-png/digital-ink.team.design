import { Icon, Icons } from '../../../shared/components/Icon';
import { CHAT_TYPE_OPTIONS, PROJECT_NICHE_OPTIONS } from '../profileFieldOptions';
import { EditableField } from './EditableField';
import { ProfileSelectField } from './ProfileSelectField';
import { ProjectSettingsLinksEditor } from './ProjectSettingsLinksEditor';
import type { Project, ProjectPatch } from '../types';
import styles from '../projects2.module.css';

interface ProjectSettingsEditorProps {
  project: Project;
  onSave: (field: keyof ProjectPatch, value: string) => void;
  onPatch: (patch: ProjectPatch) => void;
}

export function ProjectSettingsEditor({ project, onSave, onPatch }: ProjectSettingsEditorProps) {
  return (
    <div className={styles['p2-settings-editor']}>
      <section className={styles['p2-settings-sect']}>
        <h3 className={styles['p2-sect-t']}>Про клієнта</h3>
        <ProfileSelectField
          icon={Icons.briefcase}
          label="Ніша"
          value={project.niche}
          fieldKey="niche"
          options={PROJECT_NICHE_OPTIONS}
          onSave={onSave}
        />
        <EditableField
          icon={<Icon d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></>} size={15} />}
          label="Місто"
          value={project.city}
          fieldKey="city"
          onSave={onSave}
        />
        <EditableField label="Email" value={project.email} fieldKey="email" onSave={onSave} icon={Icons.mail} />
        <EditableField
          label="Телефон"
          value={project.phone}
          fieldKey="phone"
          onSave={onSave}
          icon={Icons.call}
          dial
        />
      </section>

      <section className={styles['p2-settings-sect']}>
        <h3 className={styles['p2-sect-t']}>Дати</h3>
        <EditableField
          icon={Icons.calendar}
          label="Старт підготовки"
          value={project.startDate}
          fieldKey="startDate"
          onSave={onSave}
          date
        />
        <EditableField icon={Icons.calendar} label="Оплата" value={project.paidAt} fieldKey="paidAt" onSave={onSave} date />
        <EditableField icon={Icons.calendar} label="Активація" value={project.activeDate} fieldKey="activeDate" onSave={onSave} date />
        <EditableField icon={Icons.calendar} label="Завершення" value={project.endDate} fieldKey="endDate" onSave={onSave} date />
      </section>

      <section className={styles['p2-settings-sect']}>
        <h3 className={styles['p2-sect-t']}>Посилання</h3>
        <ProjectSettingsLinksEditor
          quickLinks={project.quickLinks}
          customLinks={project.customLinks ?? []}
          linkOrder={project.linkOrder ?? []}
          onPatch={onPatch}
        />
      </section>

      <section className={styles['p2-settings-sect']}>
        <h3 className={styles['p2-sect-t']}>Технічне</h3>
        <EditableField icon={Icons.team} label="Chat ID" value={project.chatId} fieldKey="chatId" onSave={onSave} />
        <ProfileSelectField
          icon={Icons.call}
          label="Тип чату"
          value={project.chatType}
          fieldKey="chatType"
          options={CHAT_TYPE_OPTIONS}
          onSave={onSave}
        />
        <EditableField
          icon={<Icon d={<><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 8h20" /></>} size={15} />}
          label="Telegram"
          value={project.telegram}
          fieldKey="telegram"
          onSave={onSave}
        />
      </section>
    </div>
  );
}
