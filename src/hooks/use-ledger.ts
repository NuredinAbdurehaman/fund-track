"use client";

import { createContext, useContext } from "react";
import type { Transaction, TransactionInput } from "@/types/transaction";
import type { TransactionFilters } from "@/types/transaction";

export interface LedgerContextValue {
  transactions: Transaction[];
  categories: string[];
  balancesByCategory: Record<string, number>;
  myAccountTotal: number;
  selfBalance: number;
  hydrated: boolean;
  addTransaction: (input: TransactionInput) => void | Promise<void>;
  updateTransaction: (id: string, input: TransactionInput) => void | Promise<void>;
  deleteTransaction: (id: string) => void | Promise<void>;
  getFilteredTransactions: (filters: TransactionFilters) => Transaction[];
}

export const LedgerContext = createContext<LedgerContextValue | null>(null);

export function useLedger(): LedgerContextValue {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error("useLedger must be used within a LedgerProvider");
  }
  return context;
}
