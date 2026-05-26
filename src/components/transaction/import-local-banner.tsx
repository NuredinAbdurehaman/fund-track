"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLedger } from "@/hooks/use-ledger";
import {
  importLocalTransactionsApi,
  isApiEnabled,
  redirectToLogin,
} from "@/lib/api-transactions";
import {
  clearTransactions,
  hasLocalTransactions,
  loadTransactions,
} from "@/lib/storage";

const DISMISS_KEY = "fund-track:import-dismissed";

export function ImportLocalBanner() {
  const { transactions, hydrated, refreshTransactions } = useLedger();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  });

  if (!isApiEnabled() || !hydrated || dismissed) return null;
  if (!hasLocalTransactions()) return null;
  if (transactions.length > 0) return null;

  const localCount = loadTransactions().length;

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleImport() {
    setLoading(true);
    const local = loadTransactions();
    const result = await importLocalTransactionsApi(local);

    if (result === "unauthorized") {
      redirectToLogin();
      return;
    }

    if (!result) {
      toast.error("Import failed. Please try again.");
      setLoading(false);
      return;
    }

    clearTransactions();
    sessionStorage.removeItem(DISMISS_KEY);
    await refreshTransactions();
    setLoading(false);

    toast.success(
      `Imported ${result.imported} transaction${result.imported === 1 ? "" : "s"}` +
        (result.skipped > 0 ? ` (${result.skipped} skipped as duplicates)` : "")
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Import local data</CardTitle>
        <CardDescription>
          Found {localCount} transaction{localCount === 1 ? "" : "s"} saved on
          this device before you connected the database. Import them to your
          account?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button onClick={handleImport} disabled={loading}>
          {loading ? "Importing..." : "Import"}
        </Button>
        <Button variant="outline" onClick={handleDismiss} disabled={loading}>
          Dismiss
        </Button>
      </CardContent>
    </Card>
  );
}
