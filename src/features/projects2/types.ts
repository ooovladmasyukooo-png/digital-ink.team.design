export type ProjectStatus = 'active' | 'paused';
export type ProjectSubtabId = 'profile' | 'payouts' | 'effectiveness' | 'settings';

export interface Project {
  id: string;
  username: string;
  name: string;
  role: string;
  tier: string;
  hue: number;
  status: ProjectStatus;
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

export type ProjectPatch = Partial<Omit<Project, 'id' | 'hue' | 'status'>>;
