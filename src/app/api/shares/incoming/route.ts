import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const shares = await prisma.categoryShare.findMany({
      where: { recipientId: user!.id },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        ownerId: true,
        category: true,
        role: true,
        createdAt: true,
      },
    });

    const withTotals = await Promise.all(
      shares.map(async (share) => {
        const [adds, withdraws] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              userId: share.ownerId,
              category: share.category,
              type: "add",
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              userId: share.ownerId,
              category: share.category,
              type: "withdraw",
            },
            _sum: { amount: true },
          }),
        ]);

        const addSum = Number(adds._sum.amount ?? 0);
        const withdrawSum = Number(withdraws._sum.amount ?? 0);
        const total = addSum - withdrawSum;

        return { ...share, total };
      })
    );

    return NextResponse.json(withTotals);
  } catch (error) {
    console.error("GET /api/shares/incoming", error);
    return NextResponse.json({ error: "Failed to load shares" }, { status: 503 });
  }
}

