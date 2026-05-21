"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useLedger } from "@/hooks/use-ledger";
import { formatAmount } from "@/lib/ledger";

interface AppHeaderProps {
  title: string;
  description?: string;
}

export function AppHeader({ title, description }: AppHeaderProps) {
  const { selfBalance, hydrated } = useLedger();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-semibold">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {hydrated && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Self balance</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatAmount(selfBalance)}
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
