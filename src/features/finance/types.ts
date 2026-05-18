export type TransactionType = 'in' | 'out';
export type TransactionStatus = 'cleared' | 'pending';

export interface Transaction {
  id: string;
  client: string;
  type: TransactionType;
  amount: number;
  method: string;
  status: TransactionStatus;
  date: string;
}
