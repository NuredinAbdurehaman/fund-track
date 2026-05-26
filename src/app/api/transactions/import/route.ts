import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  parseImportableTransactions,
  toPrismaImportRow,
} from "@/lib/transaction-import";

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const raw = (body as { transactions?: unknown }).transactions;
    const valid = parseImportableTransactions(raw);

    if (valid.length === 0) {
      return NextResponse.json(
        { error: "No valid transactions to import" },
        { status: 400 }
      );
    }

    const result = await prisma.transaction.createMany({
      data: valid.map((t) => toPrismaImportRow(t, user!.id)),
      skipDuplicates: true,
    });

    return NextResponse.json({
      imported: result.count,
      skipped: valid.length - result.count,
    });
  } catch (error) {
    console.error("POST /api/transactions/import", error);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 503 }
    );
  }
}
