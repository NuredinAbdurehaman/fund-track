"use client";

import { useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transaction/transaction-form";
import { useLedger } from "@/hooks/use-ledger";
import type { Transaction } from "@/types/transaction";
import { toast } from "sonner";

interface TransactionRowActionsProps {
  transaction: Transaction;
}

export function TransactionRowActions({
  transaction,
}: TransactionRowActionsProps) {
  const { deleteTransaction } = useLedger();
  const [editOpen, setEditOpen] = useState(false);

  function handleDelete() {
    if (!confirm("Delete this transaction?")) return;
    deleteTransaction(transaction.id);
    toast.success("Transaction deleted");
  }

  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Edit transaction"
        onClick={() => setEditOpen(true)}
      >
        <PencilIcon className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete transaction"
        onClick={handleDelete}
      >
        <Trash2Icon className="size-3.5 text-destructive" />
      </Button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit transaction</DialogTitle>
            <DialogDescription>
              Update this entry. Balances will recalculate automatically.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            mode="edit"
            bare
            transaction={transaction}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
