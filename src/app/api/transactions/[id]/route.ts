import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPrismaData, toTransaction } from "@/lib/transaction-mapper";
import type { TransactionInput } from "@/types/transaction";

function isTransactionInput(body: unknown): body is TransactionInput {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  const type = b.type;
  return (
    (type === "add" || type === "withdraw") &&
    typeof b.amount === "number" &&
    b.amount > 0 &&
    typeof b.category === "string" &&
    typeof b.date === "string"
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body: unknown = await request.json();
    if (!isTransactionInput(body)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const row = await prisma.transaction.update({
      where: { id },
      data: toPrismaData(body),
    });
    return NextResponse.json(toTransaction(row));
  } catch (error) {
    console.error(`PATCH /api/transactions/${id}`, error);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/transactions/${id}`, error);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }
}
