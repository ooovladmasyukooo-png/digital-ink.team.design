import type { ReactNode } from 'react';
import { Icons, Icon } from '../../../shared/components/Icon';
import styles from '../team.module.css';
import type { TeamMember, TeamMemberPatch } from '../types';
import { TEAM_ROLE_OPTIONS } from '../roleOptions';
import { DangerZone } from '../components/DangerZone';
import { EditableField } from '../components/EditableField';
import { ProfileHero } from '../components/ProfileHero';

interface ProfileTabProps {
  member: TeamMember;
  avatarSrc?: string | null;
  teamPhotoSrc?: string | null;
  onPickAvatar: () => void;
  onPickTeamPhoto: () => void;
  onSave: (field: keyof TeamMemberPatch, value: string) => void;
  onDeleteMember: () => void;
}

interface SelectFieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  fieldKey: keyof TeamMemberPatch;
  options: string[];
  onSave: (field: keyof TeamMemberPatch, value: string) => void;
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

export function ProfileTab({ member, avatarSrc, teamPhotoSrc, onPickAvatar, onPickTeamPhoto, onSave, onDeleteMember }: ProfileTabProps) {
  return (
    <>
      <ProfileHero member={member} avatarSrc={avatarSrc} teamPhotoSrc={teamPhotoSrc} onPickAvatar={onPickAvatar} onPickTeamPhoto={onPickTeamPhoto} />
      <section className={styles['td-sect']}>
        <h3 className={styles['td-sect-t']}>Особисте</h3>
        <EditableField label="Name" value={member.name} fieldKey="name" onSave={onSave} icon={<Icon d={<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>} size={15} />} />
        <EditableField label="Email" value={member.email} fieldKey="email" onSave={onSave} icon={Icons.mail} />
        <EditableField label="Телефон" value={member.phone} fieldKey="phone" onSave={onSave} icon={Icons.call} />
        <EditableField icon={Icons.calendar} label="День народження" value={member.birthday} fieldKey="birthday" onSave={onSave} date />
        <EditableField icon={<Icon d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></>} size={15} />} label="Місто" value={member.city} fieldKey="city" onSave={onSave} />
        <EditableField icon={Icons.spark} label="Мрія" value={member.dream} fieldKey="dream" onSave={onSave} multiline />
        <EditableField icon={Icons.team} label="Хобі" value={member.hobby} fieldKey="hobby" onSave={onSave} multiline />
        <EditableField label="Instagram" value={member.username} fieldKey="username" onSave={onSave} icon={<Icon d={<><path d="M4 4h16v16H4z" /><path d="m9 9 6 6M15 9l-6 6" /></>} size={15} />} />
        <EditableField icon={<Icon d={<><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 8h20" /></>} size={15} />} label="Telegram" value={member.telegram} fieldKey="telegram" onSave={onSave} />
      </section>
      <section className={styles['td-sect']}>
        <h3 className={styles['td-sect-t']}>Робота</h3>
        <EditableField icon={Icons.calendar} label="В команді з" value={member.joined} fieldKey="joined" onSave={onSave} date />
        <SelectField icon={Icons.briefcase} label="Посада" value={member.role} fieldKey="role" options={TEAM_ROLE_OPTIONS} onSave={onSave} />
        <EditableField icon={<Icon d={<><path d="M4 4h16v16H4z" /><path d="M8 8h8v8H8z" /></>} size={15} />} label="Telegram ID" value={member.telegramId} fieldKey="telegramId" onSave={onSave} />
        <EditableField icon={Icons.briefcase} label="Умови роботи" value={member.conditions} fieldKey="conditions" onSave={onSave} multiline />
      </section>
      <DangerZone memberName={member.name} onConfirmDelete={onDeleteMember} />
    </>
  );
}
