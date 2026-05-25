import type {
  Transaction,
  TransactionFilters,
  TransactionInput,
} from "@/types/transaction";

export const CATEGORY_SUGGESTIONS = ["Self", "bro", "mom"] as const;

export const MY_ACCOUNT_LABEL = "My Account";

export function isReservedCategory(category: string): boolean {
  return category.trim().toLowerCase() === MY_ACCOUNT_LABEL.toLowerCase();
}

export function computeMyAccountTotal(transactions: Transaction[]): number {
  return computeBalance(transactions);
}

export function normalizeCategory(category: string): string {
  const trimmed = category.trim();
  if (!trimmed) return "Uncategorized";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function computeBalance(
  transactions: Transaction[],
  category?: string
): number {
  return transactions
    .filter((t) => !category || t.category === category)
    .reduce(
      (sum, t) => sum + (t.type === "add" ? t.amount : -t.amount),
      0
    );
}

export function getCategories(transactions: Transaction[]): string[] {
  const fromTx = transactions.map((t) => t.category);
  const merged = [...CATEGORY_SUGGESTIONS, ...fromTx];
  return [...new Set(merged)]
    .filter((cat) => cat !== MY_ACCOUNT_LABEL)
    .sort((a, b) => a.localeCompare(b));
}

export function getBalancesByCategory(
  transactions: Transaction[]
): Record<string, number> {
  const categories = [
    ...new Set(
      transactions
        .map((t) => t.category)
        .filter((cat) => cat !== MY_ACCOUNT_LABEL)
    ),
  ].sort((a, b) => a.localeCompare(b));

  return Object.fromEntries(
    categories.map((category) => [
      category,
      computeBalance(transactions, category),
    ])
  );
}

export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  return transactions.filter((t) => {
    if (filters.category && t.category !== filters.category) return false;
    if (filters.type && t.type !== filters.type) return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    return true;
  });
}

export function createTransaction(input: TransactionInput): Transaction {
  return {
    id: crypto.randomUUID(),
    type: input.type,
    amount: input.amount,
    category: normalizeCategory(input.category),
    date: input.date,
    note: input.note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
