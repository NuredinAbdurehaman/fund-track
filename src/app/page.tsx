"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TransactionForm } from "@/components/transaction/transaction-form";
import { TransactionList } from "@/components/transaction/transaction-list";

export default function HomePage() {
  return (
    <AppShell
      title="Ledger"
      description="Track adds and withdrawals by category"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <TransactionForm />
        <TransactionList />
      </div>
    </AppShell>
  );
}
