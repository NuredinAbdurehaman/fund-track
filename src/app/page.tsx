"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TransactionForm } from "@/components/transaction/transaction-form";
import { TransactionList } from "@/components/transaction/transaction-list";
import { TransactionFiltersBar } from "@/components/transaction/transaction-filters";
import { ImportLocalBanner } from "@/components/transaction/import-local-banner";
import type { TransactionFilters } from "@/types/transaction";

export default function HomePage() {
  const [filters, setFilters] = useState<TransactionFilters>({});

  return (
    <AppShell
      title="Ledger"
      description="Track adds and withdrawals by category"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <ImportLocalBanner />
        <TransactionForm />
        <TransactionFiltersBar filters={filters} onChange={setFilters} />
        <TransactionList filters={filters} />
      </div>
    </AppShell>
  );
}
