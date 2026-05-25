"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LedgerContext } from "@/hooks/use-ledger";
import {
  computeBalance,
  computeMyAccountTotal,
  createTransaction,
  filterTransactions,
  getBalancesByCategory,
  getCategories,
  normalizeCategory,
  sortTransactions,
} from "@/lib/ledger";
import {
  createTransactionApi,
  deleteTransactionApi,
  fetchTransactions,
  isApiEnabled,
  updateTransactionApi,
} from "@/lib/api-transactions";
import { loadTransactions, saveTransactions } from "@/lib/storage";
import type { Transaction, TransactionInput } from "@/types/transaction";
import type { TransactionFilters } from "@/types/transaction";

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [usingApi, setUsingApi] = useState(false);

  useEffect(() => {
    async function init() {
      if (isApiEnabled()) {
        const fromApi = await fetchTransactions();
        if (fromApi) {
          setTransactions(fromApi);
          setUsingApi(true);
          setHydrated(true);
          return;
        }
      }

      setTransactions(loadTransactions());
      setHydrated(true);
    }

    void init();
  }, []);

  useEffect(() => {
    if (hydrated && !usingApi) {
      saveTransactions(transactions);
    }
  }, [transactions, hydrated, usingApi]);

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      if (usingApi) {
        const created = await createTransactionApi(input);
        if (created) {
          setTransactions((prev) => [...prev, created]);
          return;
        }
      }

      const tx = createTransaction(input);
      setTransactions((prev) => [...prev, tx]);
    },
    [usingApi]
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput) => {
      if (usingApi) {
        const updated = await updateTransactionApi(id, input);
        if (updated) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? updated : t))
          );
          return;
        }
      }

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
    [usingApi]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (usingApi) {
        const ok = await deleteTransactionApi(id);
        if (ok) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
          return;
        }
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    [usingApi]
  );

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

  const myAccountTotal = useMemo(
    () => computeMyAccountTotal(transactions),
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
      myAccountTotal,
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
      myAccountTotal,
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
