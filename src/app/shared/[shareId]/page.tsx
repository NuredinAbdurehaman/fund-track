"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { SharedTransactionList } from "@/components/transaction/shared-transaction-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { untrackShareApi } from "@/lib/api-transactions";

function SharedCategoryInner() {
  const router = useRouter();
  const params = useParams<{ shareId: string }>();
  const shareId = params.shareId;

  async function handleUntrack() {
    if (!confirm("Untrack this shared category?")) return;
    const result = await untrackShareApi(shareId);
    if (result === "unauthorized") {
      router.push("/login");
      router.refresh();
      return;
    }
    if (!result) {
      toast.error("Failed to untrack");
      return;
    }
    toast.success("Untracked");
    router.push("/");
    router.refresh();
  }

  return (
    <AppShell title="Shared category" description="Read-only">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Read-only</Badge>
          </div>
          <Button variant="outline" onClick={handleUntrack}>
            Untrack
          </Button>
        </div>

        <SharedTransactionList shareId={shareId} />
      </div>
    </AppShell>
  );
}

export default function SharedCategoryPage() {
  return (
    <Suspense fallback={null}>
      <SharedCategoryInner />
    </Suspense>
  );
}

