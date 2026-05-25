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

export async function GET() {
  try {
    const rows = await prisma.transaction.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(rows.map(toTransaction));
  } catch (error) {
    console.error("GET /api/transactions", error);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isTransactionInput(body)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const row = await prisma.transaction.create({
      data: toPrismaData(body),
    });
    return NextResponse.json(toTransaction(row), { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions", error);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }
}
