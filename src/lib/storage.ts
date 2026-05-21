import type { Transaction, TransactionType } from "@/types/transaction";

export const STORAGE_KEY = "fund-track:transactions";

function isTransactionType(value: unknown): value is TransactionType {
  return value === "add" || value === "withdraw";
}

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    isTransactionType(t.type) &&
    typeof t.amount === "number" &&
    t.amount > 0 &&
    typeof t.category === "string" &&
    typeof t.date === "string" &&
    typeof t.createdAt === "string" &&
    (t.note === undefined || typeof t.note === "string")
  );
}

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTransaction);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
