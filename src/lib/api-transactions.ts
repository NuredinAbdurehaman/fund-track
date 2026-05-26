import type { Transaction, TransactionInput } from "@/types/transaction";

const BASE = "/api/transactions";

const fetchOptions: RequestInit = { credentials: "include" };

export function isApiEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_API === "false") return false;
  return process.env.NODE_ENV === "production";
}

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; unauthorized: boolean };

async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { ...fetchOptions, ...init });
    if (res.status === 401) {
      return { ok: false, status: 401, unauthorized: true };
    }
    if (!res.ok) {
      return { ok: false, status: res.status, unauthorized: false };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, unauthorized: false };
  }
}

export function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    const redirectTo = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?redirectTo=${redirectTo}`;
  }
}

export async function fetchTransactions(): Promise<
  Transaction[] | null | "unauthorized"
> {
  if (!isApiEnabled()) return null;

  const result = await apiFetch<Transaction[]>(BASE);
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return null;
  }
  return result.data;
}

export async function createTransactionApi(
  input: TransactionInput
): Promise<Transaction | null | "unauthorized"> {
  if (!isApiEnabled()) return null;

  const result = await apiFetch<Transaction>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return null;
  }
  return result.data;
}

export async function updateTransactionApi(
  id: string,
  input: TransactionInput
): Promise<Transaction | null | "unauthorized"> {
  if (!isApiEnabled()) return null;

  const result = await apiFetch<Transaction>(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return null;
  }
  return result.data;
}

export async function deleteTransactionApi(
  id: string
): Promise<boolean | "unauthorized"> {
  if (!isApiEnabled()) return false;

  const result = await apiFetch<{ ok: boolean }>(`${BASE}/${id}`, {
    method: "DELETE",
  });
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return false;
  }
  return true;
}
