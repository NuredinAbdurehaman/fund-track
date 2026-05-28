"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLedger } from "@/hooks/use-ledger";
import type { TransactionFilters, TransactionType } from "@/types/transaction";
import {
  createCategoryShareLinkApi,
  redirectToLogin,
} from "@/lib/api-transactions";
import { isReservedCategory } from "@/lib/ledger";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFiltersBar({
  filters,
  onChange,
}: TransactionFiltersBarProps) {
  const { categories } = useLedger();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  const selectedCategory = useMemo(() => {
    if (!filters.category) return null;
    return filters.category;
  }, [filters.category]);

  function update<K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) {
    onChange({ ...filters, [key]: value });
  }

  async function handleCreateShareLink() {
    if (!selectedCategory) {
      toast.error("Select a category to share");
      return;
    }
    if (isReservedCategory(selectedCategory)) {
      toast.error("This category can't be shared");
      return;
    }

    setShareLoading(true);
    const result = await createCategoryShareLinkApi(selectedCategory);
    if (result === "unauthorized") {
      redirectToLogin();
      return;
    }
    if (!result) {
      toast.error("Failed to create share link");
      setShareLoading(false);
      return;
    }
    setShareUrl(result.url);
    setShareLoading(false);
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Filters</CardTitle>
          <Dialog
            open={shareOpen}
            onOpenChange={(open) => {
              setShareOpen(open);
              if (!open) {
                setShareUrl(null);
                setShareLoading(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedCategory}
              >
                Share category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Share category</DialogTitle>
                <DialogDescription>
                  Share &quot;{selectedCategory ?? "—"}&quot; as read-only using
                  an invite link.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <Button onClick={handleCreateShareLink} disabled={shareLoading}>
                  {shareLoading ? "Creating..." : "Create link"}
                </Button>

                {shareUrl && (
                  <div className="grid gap-2">
                    <Input readOnly value={shareUrl} />
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={copyShareUrl}>
                        Copy link
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShareUrl(null)}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
