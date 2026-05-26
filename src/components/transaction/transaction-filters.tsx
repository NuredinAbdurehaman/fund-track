"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLedger } from "@/hooks/use-ledger";
import type { TransactionFilters, TransactionType } from "@/types/transaction";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFiltersBar({
  filters,
  onChange,
}: TransactionFiltersBarProps) {
  const { categories } = useLedger();

  function update<K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Filters</CardTitle>
        <CardDescription className="hidden sm:block">
          Narrow the transaction log
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-category">Category</Label>
          <Select
            value={filters.category ?? "all"}
            onValueChange={(v) =>
              update("category", v === "all" ? undefined : v)
            }
          >
            <SelectTrigger id="filter-category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-type">Type</Label>
          <Select
            value={filters.type ?? "all"}
            onValueChange={(v) =>
              update("type", v === "all" ? undefined : (v as TransactionType))
            }
          >
            <SelectTrigger id="filter-type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="add">Add</SelectItem>
              <SelectItem value="withdraw">Withdraw</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-from">From date</Label>
          <Input
            id="filter-from"
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => update("dateFrom", e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-to">To date</Label>
          <Input
            id="filter-to"
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => update("dateTo", e.target.value || undefined)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
