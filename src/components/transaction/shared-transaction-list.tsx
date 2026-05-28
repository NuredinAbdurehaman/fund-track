"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchSharedTransactionsApi,
  redirectToLogin,
} from "@/lib/api-transactions";
import { formatAmount, sortTransactions } from "@/lib/ledger";
import type { Transaction } from "@/types/transaction";

export function SharedTransactionList({ shareId }: { shareId: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function load() {
      setHydrated(false);
      const result = await fetchSharedTransactionsApi(shareId);
      if (result === "unauthorized") {
        redirectToLogin();
        return;
      }
      if (!result) {
        toast.error("Failed to load shared transactions");
        setTransactions([]);
        setHydrated(true);
        return;
      }
      setTransactions(result);
      setHydrated(true);
    }

    void load();
  }, [shareId]);

  const displayed = useMemo(
    () => sortTransactions(transactions),
    [transactions]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction log</CardTitle>
        <CardDescription>
          Read-only view — you can’t edit the owner’s ledger.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : displayed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap">{tx.date}</TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.type === "add" ? "default" : "destructive"}
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {tx.type === "add" ? "+" : "-"}
                    {formatAmount(tx.amount)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {tx.note ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

