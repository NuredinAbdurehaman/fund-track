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

    return NextResponse.json(shares);
  } catch (error) {
    console.error("GET /api/shares/incoming", error);
    return NextResponse.json({ error: "Failed to load shares" }, { status: 503 });
  }
}

