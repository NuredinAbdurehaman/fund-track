"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryCombobox } from "@/components/category/category-combobox";
import { useLedger } from "@/hooks/use-ledger";
import { isReservedCategory, todayIsoDate } from "@/lib/ledger";
import type { Transaction, TransactionInput, TransactionType } from "@/types/transaction";

interface TransactionFormProps {
  mode?: "create" | "edit";
  transaction?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
  bare?: boolean;
}

export function TransactionForm({
  mode = "create",
  transaction,
  onSuccess,
  onCancel,
  bare = false,
}: TransactionFormProps) {
  const { addTransaction, updateTransaction, categories } = useLedger();

  const [type, setType] = useState<TransactionType>(transaction?.type ?? "add");
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : ""
  );
  const [category, setCategory] = useState(transaction?.category ?? "Self");
  const [date, setDate] = useState(transaction?.date ?? todayIsoDate());
  const [note, setNote] = useState(transaction?.note ?? "");

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setDate(transaction.date);
      setNote(transaction.note ?? "");
    }
  }, [transaction]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (isReservedCategory(category)) {
      toast.error("My Account is reserved for the total balance");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid amount greater than 0");
      return;
    }

    const input: TransactionInput = {
      type,
      amount: parsedAmount,
      category,
      date,
      note: note.trim() || undefined,
    };

    if (mode === "edit" && transaction) {
      updateTransaction(transaction.id, input);
      toast.success("Transaction updated");
    } else {
      addTransaction(input);
      toast.success("Transaction added");
      setAmount("");
      setNote("");
      setDate(todayIsoDate());
    }

    onSuccess?.();
  }

  const form = (
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as TransactionType)}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add</SelectItem>
                <SelectItem value="withdraw">Withdraw</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <CategoryCombobox
              value={category}
              onChange={setCategory}
              categories={categories}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="What was this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">
              {mode === "edit" ? "Save changes" : "Add transaction"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
  );

  if (bare) return form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Edit transaction" : "New transaction"}
        </CardTitle>
        <CardDescription>
          Record money added to or withdrawn from a category.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}
