import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Transaction, TransactionInput } from "@/types/transaction";

const BASE = "/api/transactions";

const fetchOptions: RequestInit = { credentials: "include" };

export function isApiEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_API === "false") return false;
  return process.env.NODE_ENV === "production";
}

export function isAuthConfigured(): boolean {
  return isSupabaseConfigured();
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

const AUTH_PATHS = ["/login", "/auth"];

export function isAuthPagePath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function redirectToLogin(): void {
  if (typeof window === "undefined") return;

  const pathname = window.location.pathname;
  if (isAuthPagePath(pathname)) return;

  const redirectTo = encodeURIComponent(pathname);
  window.location.href = `/login?redirectTo=${redirectTo}`;
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

export type ImportResult = { imported: number; skipped: number };

export async function importLocalTransactionsApi(
  transactions: Transaction[]
): Promise<ImportResult | "unauthorized" | null> {
  if (!isApiEnabled()) return null;

  const result = await apiFetch<ImportResult>(`${BASE}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions }),
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

export type IncomingShare = {
  id: string;
  ownerId: string;
  category: string;
  role: string;
  createdAt: string;
  total: number;
};

export async function createCategoryShareLinkApi(
  category: string
): Promise<{ url: string } | "unauthorized" | null> {
  const result = await apiFetch<{ url: string }>(`/api/shares/category-links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, role: "viewer" }),
  });
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return null;
  }
  return result.data;
}

export async function acceptShareTokenApi(
  token: string
): Promise<{ shareId: string } | "unauthorized" | null> {
  const result = await apiFetch<{ shareId: string }>(`/api/shares/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return null;
  }
  return result.data;
}

export async function fetchIncomingSharesApi(): Promise<
  IncomingShare[] | "unauthorized" | null
> {
  const result = await apiFetch<IncomingShare[]>(`/api/shares/incoming`);
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return null;
  }
  return result.data;
}

export async function fetchSharedTransactionsApi(
  shareId: string
): Promise<Transaction[] | "unauthorized" | null> {
  const result = await apiFetch<Transaction[]>(
    `/api/shares/${encodeURIComponent(shareId)}/transactions`
  );
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return null;
  }
  return result.data;
}

export async function untrackShareApi(
  shareId: string
): Promise<boolean | "unauthorized"> {
  const result = await apiFetch<{ ok: boolean }>(
    `/api/shares/incoming/${encodeURIComponent(shareId)}`,
    { method: "DELETE" }
  );
  if (!result.ok) {
    if (result.unauthorized) return "unauthorized";
    return false;
  }
  return true;
}
