export type TeamMemberStatus = 'active' | 'paused';
export type TeamSubtabId = 'profile' | 'tasks' | 'payouts' | 'effectiveness' | 'settings';

export interface TeamMember {
  id: string;
  username: string;
  name: string;
  role: string;
  tier: string;
  hue: number;
  status: TeamMemberStatus;
  city: string;
  birthday: string;
  joined: string;
  conditions: string;
  dream: string;
  hobby: string;
  email: string;
  phone: string;
  telegram: string;
  telegramId: string;
  comments: string;
}

export type TeamMemberPatch = Partial<Omit<TeamMember, 'id' | 'hue' | 'status'>>;
