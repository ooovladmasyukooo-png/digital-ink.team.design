import { useRef } from 'react';
import { cx } from '../../shared/styles/cx';
import { TeamDetailHeader } from './components/TeamDetailHeader';
import { TeamComingSoon } from './components/TeamComingSoon';
import { ProfileTab } from './tabs/ProfileTab';
import styles from './team.module.css';
import type { TeamMember, TeamMemberPatch, TeamSubtabId } from './types';

interface TeamDetailProps {
  member: TeamMember;
  activeMembers: TeamMember[];
  memberAvatars: Record<string, string>;
  subtab: TeamSubtabId;
  avatarSrc?: string | null;
  teamPhotoSrc?: string | null;
  onBack: () => void;
  onSubtabChange: (tab: TeamSubtabId) => void;
  onSwitchMember: (memberId: string) => void;
  onSave: (memberId: string, field: keyof TeamMemberPatch, value: string) => void;
  onAvatarChange: (memberId: string, src: string) => void;
  onTeamPhotoChange: (memberId: string, src: string) => void;
  onDeleteMember: (memberId: string) => void;
}

export function TeamDetail({
  member,
  activeMembers,
  memberAvatars,
  subtab,
  avatarSrc,
  teamPhotoSrc,
  onBack,
  onSubtabChange,
  onSwitchMember,
  onSave,
  onAvatarChange,
  onTeamPhotoChange,
  onDeleteMember,
}: TeamDetailProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const teamPhotoRef = useRef<HTMLInputElement>(null);

  const pickAvatar = () => {
    fileRef.current?.click();
  };

  const pickTeamPhoto = () => {
    teamPhotoRef.current?.click();
  };

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onAvatarChange(member.id, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTeamPhotoFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onTeamPhotoChange(member.id, reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const save = (field: keyof TeamMemberPatch, value: string) => onSave(member.id, field, value);

  const isComingSoonView = subtab === 'payouts' || subtab === 'effectiveness' || subtab === 'settings';

  return (
    <div className={styles['team-shell']}>
      <TeamDetailHeader
        member={member}
        activeMembers={activeMembers}
        memberAvatars={memberAvatars}
        avatarSrc={avatarSrc}
        activeSubtab={subtab}
        onBack={onBack}
        onSubtabChange={onSubtabChange}
        onSwitchMember={onSwitchMember}
      />
      <main className={cx(styles['team-main'], styles['team-main-full'], isComingSoonView && styles['team-main-flush'])}>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarFile} />
        <input ref={teamPhotoRef} type="file" accept="image/*" className="sr-only" onChange={handleTeamPhotoFile} />
        <div className={cx(styles['td-body'], styles['td-body-wide'], isComingSoonView && styles['td-body-flush'])}>
          {subtab === 'profile' ? (
            <ProfileTab
              member={member}
              avatarSrc={avatarSrc}
              teamPhotoSrc={teamPhotoSrc}
              onPickAvatar={pickAvatar}
              onPickTeamPhoto={pickTeamPhoto}
              onSave={save}
              onDeleteMember={() => onDeleteMember(member.id)}
            />
          ) : null}
          {subtab === 'payouts' ? <TeamComingSoon subtitle="Розділ виплат та звітності у розробці." /> : null}
          {subtab === 'effectiveness' ? (
            <TeamComingSoon subtitle="Метрики та аналітика ефективності у розробці." />
          ) : null}
          {subtab === 'settings' ? <TeamComingSoon subtitle="Додаткові налаштування профілю у розробці." /> : null}
        </div>
      </main>
    </div>
  );
}
