"use client";

import { useMemo } from "react";
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
import { useLedger } from "@/hooks/use-ledger";
import { formatAmount, sortTransactions } from "@/lib/ledger";
import type { TransactionFilters } from "@/types/transaction";
import { TransactionRowActions } from "@/components/transaction/transaction-row-actions";

interface TransactionListProps {
  filters?: TransactionFilters;
}

export function TransactionList({ filters = {} }: TransactionListProps) {
  const { transactions, hydrated, getFilteredTransactions } = useLedger();

  const displayed = useMemo(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    if (hasFilters) {
      return getFilteredTransactions(filters);
    }
    return sortTransactions(transactions);
  }, [filters, transactions, getFilteredTransactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction log</CardTitle>
        <CardDescription>
          Audit trail — balances are computed from these entries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : displayed.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions yet. Add your first entry above.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="w-[80px]" />
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
                  <TableCell>
                    <TransactionRowActions transaction={tx} />
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
