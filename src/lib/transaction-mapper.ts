import type { Transaction as PrismaTransaction } from "@prisma/client";
import type { Transaction, TransactionInput, TransactionType } from "@/types/transaction";
import { normalizeCategory } from "@/lib/ledger";

function isTransactionType(value: string): value is TransactionType {
  return value === "add" || value === "withdraw";
}

export function toTransaction(row: PrismaTransaction): Transaction {
  const date =
    row.date instanceof Date
      ? row.date.toISOString().slice(0, 10)
      : String(row.date).slice(0, 10);

  return {
    id: row.id,
    type: isTransactionType(row.type) ? row.type : "add",
    amount: Number(row.amount),
    category: row.category,
    date,
    note: row.note ?? undefined,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
  };
}

export function toPrismaData(input: TransactionInput) {
  return {
    type: input.type,
    amount: input.amount,
    category: normalizeCategory(input.category),
    date: new Date(`${input.date}T00:00:00.000Z`),
    note: input.note?.trim() || null,
  };
}
