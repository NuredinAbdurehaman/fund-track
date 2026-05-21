export type TransactionType = "add" | "withdraw";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface TransactionFilters {
  category?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
}
