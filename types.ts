export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Transaction {
  id: string; // Generated client-side if not present
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  netChange: number;
  currency: string;
  statementDateRange?: string;
}

export interface AnalysisResult {
  summary: Summary;
  transactions: Transaction[];
}