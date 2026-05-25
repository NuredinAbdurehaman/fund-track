"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLedger } from "@/hooks/use-ledger";
import { formatAmount } from "@/lib/ledger";

export function SummaryCards() {
  const { transactions, selfBalance, myAccountTotal, balancesByCategory, hydrated } =
    useLedger();

  const stats = useMemo(() => {
    const peopleCategories = Object.entries(balancesByCategory).filter(
      ([cat]) => cat !== "Self"
    );
    const peopleNet = peopleCategories.reduce(
      (sum, [, balance]) => sum + balance,
      0
    );
    const totalNet = myAccountTotal;
    const addCount = transactions.filter((t) => t.type === "add").length;
    const withdrawCount = transactions.filter((t) => t.type === "withdraw").length;

    return {
      totalNet,
      peopleNet,
      addCount,
      withdrawCount,
      categoryCount: Object.keys(balancesByCategory).length,
    };
  }, [transactions, balancesByCategory, myAccountTotal]);

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const cards = [
    {
      title: "Self balance",
      value: formatAmount(selfBalance),
      description: "Your own funds",
    },
    {
      title: "My Account",
      value: formatAmount(stats.totalNet),
      description: "Total across all categories",
    },
    {
      title: "People net",
      value: formatAmount(stats.peopleNet),
      description: "Excluding Self",
    },
    {
      title: "Transactions",
      value: String(transactions.length),
      description: `${stats.addCount} adds · ${stats.withdrawCount} withdraws`,
    },
    {
      title: "Categories",
      value: String(stats.categoryCount),
      description: "Active in ledger",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}

      {Object.entries(balancesByCategory)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, balance]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardDescription>{category}</CardDescription>
              <CardTitle
                className={`text-2xl tabular-nums ${
                  balance < 0 ? "text-destructive" : ""
                }`}
              >
                {formatAmount(balance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Category balance</p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
