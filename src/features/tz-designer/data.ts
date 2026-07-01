import type { DesignerReferralProfile, ReferralTransaction } from './types';

export const designerReferral: DesignerReferralProfile = {
  code: 'DSGN0042',
  totalEarned: 12450,
  pending: 3200,
  activeClients: 8,
};

export const referralTransactions: ReferralTransaction[] = [
  {
    id: 'RF-1041',
    project: 'Ink Studio 30',
    refCode: 'INK0030',
    amount: 4500,
    status: 'cleared',
    date: '18.05.2026',
  },
  {
    id: 'RF-1040',
    project: 'Ink Studio 12',
    refCode: 'INK0012',
    amount: 3200,
    status: 'pending',
    date: '16.05.2026',
  },
  {
    id: 'RF-1039',
    project: 'Ink Studio 7',
    refCode: 'INK0007',
    amount: 2800,
    status: 'cleared',
    date: '12.05.2026',
  },
  {
    id: 'RF-1038',
    project: 'Ink Studio 24',
    refCode: 'INK0024',
    amount: 1950,
    status: 'cleared',
    date: '08.05.2026',
  },
  {
    id: 'RF-1037',
    project: 'Ink Studio 3',
    refCode: 'INK0003',
    amount: 4100,
    status: 'pending',
    date: '05.05.2026',
  },
];
