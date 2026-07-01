export type ReferralTransactionStatus = 'cleared' | 'pending';

export interface ReferralTransaction {
  id: string;
  project: string;
  refCode: string;
  amount: number;
  status: ReferralTransactionStatus;
  date: string;
}

export interface DesignerReferralProfile {
  code: string;
  totalEarned: number;
  pending: number;
  activeClients: number;
}
