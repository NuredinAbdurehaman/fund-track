import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateShareToken, hashShareToken } from "@/lib/sharing/tokens";
import { isReservedCategory, normalizeCategory } from "@/lib/ledger";

type CreateCategoryLinkBody = {
  category: string;
  role?: "viewer";
  expiresInDays?: number;
};

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { category, role = "viewer", expiresInDays } =
      body as CreateCategoryLinkBody;

    if (typeof category !== "string" || !category.trim()) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (isReservedCategory(category)) {
      return NextResponse.json({ error: "Category is reserved" }, { status: 400 });
    }
    if (role !== "viewer") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const normalizedCategory = normalizeCategory(category);
    const token = generateShareToken();
    const tokenHash = hashShareToken(token);

    const expiresAt =
      typeof expiresInDays === "number" && Number.isFinite(expiresInDays) && expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

    await prisma.categoryShareLink.create({
      data: {
        ownerId: user!.id,
        category: normalizedCategory,
        role,
        tokenHash,
        expiresAt,
      },
    });

    const origin = request.headers.get("origin") ?? "";
    const path = `/shares/accept?token=${encodeURIComponent(token)}`;
    const url = origin ? new URL(path, origin).toString() : path;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/shares/category-links", error);
    return NextResponse.json({ error: "Failed to create link" }, { status: 503 });
  }
}

