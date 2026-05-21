"use client";

import { AppShell } from "@/components/layout/app-shell";
import { SummaryCards } from "@/components/dashboard/summary-cards";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      description="Summary computed from your transaction log"
    >
      <SummaryCards />
    </AppShell>
  );
}
