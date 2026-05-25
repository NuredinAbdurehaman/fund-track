"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LedgerContext } from "@/hooks/use-ledger";
import {
  computeBalance,
  createTransaction,
  filterTransactions,
  getBalancesByCategory,
  getCategories,
  normalizeCategory,
  sortTransactions,
} from "@/lib/ledger";
import { loadTransactions, saveTransactions } from "@/lib/storage";
import type { Transaction, TransactionInput } from "@/types/transaction";
import type { TransactionFilters } from "@/types/transaction";

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveTransactions(transactions);
    }
  }, [transactions, hydrated]);

  const addTransaction = useCallback((input: TransactionInput) => {
    const tx = createTransaction(input);
    setTransactions((prev) => [...prev, tx]);
  }, []);

  const updateTransaction = useCallback(
    (id: string, input: TransactionInput) => {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                type: input.type,
                amount: input.amount,
                category: normalizeCategory(input.category),
                date: input.date,
                note: input.note?.trim() || undefined,
              }
            : t
        )
      );
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const categories = useMemo(
    () => getCategories(transactions),
    [transactions]
  );

  const balancesByCategory = useMemo(
    () => getBalancesByCategory(transactions),
    [transactions]
  );

  const selfBalance = useMemo(
    () => computeBalance(transactions, "Self"),
    [transactions]
  );

  const getFilteredTransactions = useCallback(
    (filters: TransactionFilters) =>
      sortTransactions(filterTransactions(transactions, filters)),
    [transactions]
  );

  const value = useMemo(
    () => ({
      transactions,
      categories,
      balancesByCategory,
      selfBalance,
      hydrated,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getFilteredTransactions,
    }),
    [
      transactions,
      categories,
      balancesByCategory,
      selfBalance,
      hydrated,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getFilteredTransactions,
    ]
  );

  return (
    <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
  );
}
