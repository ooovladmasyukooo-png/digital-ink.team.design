export type ReferralLinkStatus = 'active' | 'inactive';

export interface ReferralLinkStats {
  views: number;
  clicks: number;
  previews: number;
  joined: number;
}

export interface ReferralLinkFinance {
  accrued: number;
  paid: number;
  frozen: number;
}

export interface ReferralLink {
  id: string;
  code: string;
  masterName: string;
  projectName: string | null;
  status: ReferralLinkStatus;
  submittedAt: string;
  stats: ReferralLinkStats;
  finance: ReferralLinkFinance;
}

export type ReferralTabId = 'referral' | 'materials';

export type ReferralMaterialStatus = 'draft' | 'available' | 'closed';

export interface DesignerReferralProfile {
  code: string;
  totalEarned: number;
  pending: number;
  activeClients: number;
}

export interface ReferralMaterialStats {
  partnersUsed: number;
  views: number;
  linkClicks: number;
  joined: number;
}

export interface ReferralMaterial {
  id: string;
  title: string;
  description: string;
  html: string;
  status: ReferralMaterialStatus;
  stats: ReferralMaterialStats;
  updatedAt: string;
}

export type ReferralMaterialPatch = Partial<Omit<ReferralMaterial, 'id'>>;
