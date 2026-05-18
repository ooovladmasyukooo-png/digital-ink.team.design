import { useRef } from 'react';
import { Avatar } from '../../shared/components/Avatar';
import { Icon, Icons } from '../../shared/components/Icon';
import { Topbar } from '../../shared/components/Topbar';
import type { TopbarTab } from '../../shared/types/common';
import { cx } from '../../shared/styles/cx';
import { TeamComingSoon } from './components/TeamComingSoon';
import { ProfileTab } from './tabs/ProfileTab';
import styles from './team.module.css';
import type { TeamMember, TeamMemberPatch, TeamSubtabId } from './types';

interface TeamDetailProps {
  member: TeamMember;
  subtab: TeamSubtabId;
  avatarSrc?: string | null;
  teamPhotoSrc?: string | null;
  onBack: () => void;
  onSubtabChange: (tab: TeamSubtabId) => void;
  onSave: (memberId: string, field: keyof TeamMemberPatch, value: string) => void;
  onAvatarChange: (memberId: string, src: string) => void;
  onTeamPhotoChange: (memberId: string, src: string) => void;
  onDeleteMember: (memberId: string) => void;
}

export function TeamDetail({
  member,
  subtab,
  avatarSrc,
  teamPhotoSrc,
  onBack,
  onSubtabChange,
  onSave,
  onAvatarChange,
  onTeamPhotoChange,
  onDeleteMember,
}: TeamDetailProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const teamPhotoRef = useRef<HTMLInputElement>(null);
  const shortName = member.name.split(' ').map((part, index) => (index === 0 ? `${part[0]}.` : part)).join(' ');

  const tabs: TopbarTab<TeamSubtabId>[] = [
    { id: 'profile', label: shortName, icon: <Avatar name={member.name} hue={member.hue} src={avatarSrc} />, n: undefined },
    { id: 'payouts', label: 'Виплати', icon: Icons.finance },
    { id: 'effectiveness', label: 'Ефективність', icon: Icons.analytics },
    { id: 'settings', label: 'Налаштування', icon: Icons.settings },
  ];

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
      <Topbar
        title={
          <button className={styles['back-icn']} onClick={onBack} title="Назад до списку" type="button">
            <Icon d={<path d="M19 12H5M12 19l-7-7 7-7" />} size={16} />
          </button>
        }
        tabs={tabs}
        activeTab={subtab}
        onTab={onSubtabChange}
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
