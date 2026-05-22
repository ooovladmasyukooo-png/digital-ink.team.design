export type ProjectStatus = 'active' | 'paused';
export type ProjectSubtabId =
  | 'profile'
  | 'tasks'
  | 'documents'
  | 'daily-reports'
  | 'bookings'
  | 'design-brief'
  | 'invoices'
  | 'settings';

export interface ProjectQuickLinks {
  instagram: string;
  facebookAds: string;
  googleDrive: string;
}

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
  quickLinks: ProjectQuickLinks;
}

export type ProjectPatch = Partial<Omit<Project, 'id' | 'hue' | 'status'>>;
