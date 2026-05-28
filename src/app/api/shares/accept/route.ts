import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { hashShareToken } from "@/lib/sharing/tokens";

type AcceptBody = { token: string };

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { token } = body as AcceptBody;
    if (typeof token !== "string" || token.trim().length < 10) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const tokenHash = hashShareToken(token.trim());

    const link = await prisma.categoryShareLink.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link is invalid or expired" }, { status: 404 });
    }

    if (link.ownerId === user!.id) {
      return NextResponse.json({ error: "Cannot accept your own link" }, { status: 400 });
    }

    const share = await prisma.categoryShare.upsert({
      where: {
        ownerId_category_recipientId: {
          ownerId: link.ownerId,
          category: link.category,
          recipientId: user!.id,
        },
      },
      update: {
        role: link.role,
      },
      create: {
        ownerId: link.ownerId,
        category: link.category,
        recipientId: user!.id,
        role: link.role,
      },
    });

    return NextResponse.json({ shareId: share.id });
  } catch (error) {
    console.error("POST /api/shares/accept", error);
    return NextResponse.json({ error: "Accept failed" }, { status: 503 });
  }
}

