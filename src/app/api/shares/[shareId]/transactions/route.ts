import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toTransaction } from "@/lib/transaction-mapper";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { shareId } = await params;

  try {
    const share = await prisma.categoryShare.findFirst({
      where: { id: shareId, recipientId: user!.id },
      select: { ownerId: true, category: true },
    });

    if (!share) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rows = await prisma.transaction.findMany({
      where: { userId: share.ownerId, category: share.category },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(rows.map(toTransaction));
  } catch (error) {
    console.error(`GET /api/shares/${shareId}/transactions`, error);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }
}

