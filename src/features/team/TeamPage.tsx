import { useEffect, useState } from 'react';
import { teamMembers } from './data';
import { TeamDetail } from './TeamDetail';
import { TeamList } from './TeamList';
import type { TeamMemberPatch, TeamSubtabId } from './types';

const SUBTAB_DOC_TITLE: Record<TeamSubtabId, string> = {
  profile: 'Профіль',
  tasks: 'Задачі',
  payouts: 'Виплати',
  effectiveness: 'Ефективність',
  settings: 'Налаштування',
};

interface TeamPageProps {
  selectedMemberId: string | null;
  teamSubtab: TeamSubtabId;
  onNavigateMember: (memberId: string | null, replaceHistory?: boolean, keepSubtab?: boolean) => void;
  onNavigateSubtab: (tab: TeamSubtabId) => void;
  onOpenTaskFullPage: (taskId: string) => void;
}

export function TeamPage({
  selectedMemberId,
  teamSubtab,
  onNavigateMember,
  onNavigateSubtab,
  onOpenTaskFullPage,
}: TeamPageProps) {
  const [removedMemberIds, setRemovedMemberIds] = useState<Set<string>>(() => new Set());
  const [overrides, setOverrides] = useState<Record<string, TeamMemberPatch>>({});
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [teamPhotos, setTeamPhotos] = useState<Record<string, string>>({});

  const members = teamMembers
    .filter((member) => !removedMemberIds.has(member.id))
    .map((member) => ({ ...member, ...(overrides[member.id] ?? {}) }));
  const selectedMember = selectedMemberId ? members.find((member) => member.id === selectedMemberId) ?? null : null;

  useEffect(() => {
    if (!selectedMemberId) return;
    const known = teamMembers.some((member) => member.id === selectedMemberId);
    const visible = known && !removedMemberIds.has(selectedMemberId);
    if (visible) return;
    onNavigateMember(null, true);
  }, [selectedMemberId, removedMemberIds, onNavigateMember]);

  useEffect(() => {
    if (!selectedMember) {
      document.title = 'Команда · Aurora CRM';
      return;
    }
    const tabPart = SUBTAB_DOC_TITLE[teamSubtab];
    document.title =
      teamSubtab === 'profile'
        ? `${selectedMember.name} · Профіль · Команда · Aurora CRM`
        : `${tabPart} · ${selectedMember.name} · Команда · Aurora CRM`;
  }, [selectedMember, teamSubtab]);

  const saveField = (memberId: string, field: keyof TeamMemberPatch, value: string) => {
    setOverrides((current) => ({
      ...current,
      [memberId]: {
        ...(current[memberId] ?? {}),
        [field]: value,
      },
    }));
  };

  const deleteMember = (memberId: string) => {
    setRemovedMemberIds((current) => new Set(current).add(memberId));
    onNavigateMember(null);
  };

  if (!selectedMember) {
    return <TeamList members={members} onSelect={(id) => onNavigateMember(id)} />;
  }

  return (
    <TeamDetail
      member={selectedMember}
      activeMembers={members.filter((item) => item.status === 'active')}
      memberAvatars={avatars}
      subtab={teamSubtab}
      avatarSrc={avatars[selectedMember.id]}
      teamPhotoSrc={teamPhotos[selectedMember.id]}
      onBack={() => onNavigateMember(null)}
      onSubtabChange={onNavigateSubtab}
      onSwitchMember={(memberId) => onNavigateMember(memberId, false, true)}
      onSave={saveField}
      onAvatarChange={(memberId, src) => setAvatars((current) => ({ ...current, [memberId]: src }))}
      onTeamPhotoChange={(memberId, src) => setTeamPhotos((current) => ({ ...current, [memberId]: src }))}
      onDeleteMember={deleteMember}
      onOpenTaskFullPage={onOpenTaskFullPage}
    />
  );
}
