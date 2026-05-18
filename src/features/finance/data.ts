import type { Transaction } from './types';

export const transactions: Transaction[] = [
  { id: 'TX-3041', client: 'Reinhardt GmbH', type: 'in', amount: 124000, method: 'Wire', status: 'cleared', date: '15.05.2026 09:14' },
  { id: 'TX-3040', client: 'Aurora Co payroll', type: 'out', amount: -318400, method: 'SEPA', status: 'cleared', date: '15.05.2026 06:00' },
  { id: 'TX-3039', client: 'Mansour Holdings', type: 'in', amount: 218400, method: 'Wire', status: 'cleared', date: '14.05.2026 17:42' },
  { id: 'TX-3038', client: 'Stripe payout', type: 'in', amount: 48230, method: 'Stripe', status: 'cleared', date: '14.05.2026 12:08' },
  { id: 'TX-3037', client: 'AWS Infrastructure', type: 'out', amount: -14820, method: 'Card', status: 'pending', date: '14.05.2026 09:01' },
  { id: 'TX-3036', client: 'Castellano s.r.l.', type: 'in', amount: 31500, method: 'SEPA', status: 'cleared', date: '13.05.2026 19:55' },
];
