import { normalizeCategory, isReservedCategory } from "@/lib/ledger";
import { parseTransactionList } from "@/lib/storage";
import type { Transaction } from "@/types/transaction";

export function parseImportableTransactions(items: unknown): Transaction[] {
  return parseTransactionList(items).filter(
    (t) => !isReservedCategory(t.category)
  );
}

export function toPrismaImportRow(transaction: Transaction, userId: string) {
  return {
    id: transaction.id,
    userId,
    type: transaction.type,
    amount: transaction.amount,
    category: normalizeCategory(transaction.category),
    date: new Date(`${transaction.date}T00:00:00.000Z`),
    note: transaction.note?.trim() || null,
    createdAt: new Date(transaction.createdAt),
  };
}
