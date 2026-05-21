import type { Transaction, TransactionInput } from "@/types/transaction";

const BASE = "/api/transactions";

export function isApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_API === "true";
}

export async function fetchTransactions(): Promise<Transaction[] | null> {
  if (!isApiEnabled()) return null;

  try {
    const res = await fetch(BASE);
    if (!res.ok) return null;
    return (await res.json()) as Transaction[];
  } catch {
    return null;
  }
}

export async function createTransactionApi(
  input: TransactionInput
): Promise<Transaction | null> {
  if (!isApiEnabled()) return null;

  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as Transaction;
  } catch {
    return null;
  }
}

export async function updateTransactionApi(
  id: string,
  input: TransactionInput
): Promise<Transaction | null> {
  if (!isApiEnabled()) return null;

  try {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as Transaction;
  } catch {
    return null;
  }
}

export async function deleteTransactionApi(id: string): Promise<boolean> {
  if (!isApiEnabled()) return false;

  try {
    const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}
