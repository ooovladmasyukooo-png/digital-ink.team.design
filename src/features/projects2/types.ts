export type ProjectStatus = 'active' | 'paused';
export type ProjectSubtabId =
  | 'profile'
  | 'tasks'
  | 'documents'
  | 'daily-reports'
  | 'bookings'
  | 'design-brief';

export interface ProjectClientContact {
  id: string;
  label: string;
  email: string;
  phone: string;
}

/** Стаття з каталогу, надіслана клієнту з його реф. кодом у посиланні. */
export interface ProjectClientArticleShare {
  id: string;
  articleId: string;
  comment: string;
  /** DD.MM.YYYY — коли надіслали клієнту; порожньо, якщо ще ні */
  sentAt: string;
}

export interface ProjectQuickLinks {
  instagram: string;
  facebookAds: string;
  googleDrive: string;
  reporting: string;
  website: string;
}

export interface ProjectSettingExtra {
  id: string;
  label: string;
  value: string;
}

export interface ProjectCustomLink {
  id: string;
  label: string;
  url: string;
}

export type ProjectTeamPositionId =
  | 'media_buyer'
  | 'pm'
  | 'team_lead'
  | 'designer'
  | 'booking'
  | 'strategist'
  | 'analyst';

/** Один запис = спеціаліст + одна роль на проєкті (той самий людина може мати кілька записів). */
export interface ProjectTeamAssignment {
  id: string;
  memberId: string;
  position: ProjectTeamPositionId;
}

export interface Project {
  id: string;
  username: string;
  name: string;
  role: string;
  tier: string;
  hue: number;
  status: ProjectStatus;
  country: string;
  city: string;
  pipelineStatus: string;
  churnRisk: string;
  result: string;
  niche: string;
  aboutClient: string;
  mbPmComment: string;
  hasTestimonials: boolean;
  hasCase: boolean;
  paidAt: string;
  startDate: string;
  activeDate: string;
  endDate: string;
  chatId: string;
  chatType: string;
  birthday: string;
  joined: string;
  conditions: string;
  dream: string;
  hobby: string;
  email: string;
  phone: string;
  clientContacts: ProjectClientContact[];
  referralCode: string;
  clientArticleShares: ProjectClientArticleShare[];
  telegram: string;
  telegramId: string;
  comments: string;
  teamAssignments: ProjectTeamAssignment[];
  quickLinks: ProjectQuickLinks;
  /** Порядок посилань у налаштуваннях і в меню Links (builtin keys + custom ids) */
  linkOrder: string[];
  settingExtras: ProjectSettingExtra[];
  customLinks: ProjectCustomLink[];
}

export type ProjectPatch = Partial<Omit<Project, 'id' | 'hue' | 'status'>>;
