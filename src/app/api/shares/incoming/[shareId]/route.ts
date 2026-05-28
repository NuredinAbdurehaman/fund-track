import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { shareId } = await params;

  try {
    const share = await prisma.categoryShare.findFirst({
      where: { id: shareId, recipientId: user!.id },
      select: { id: true },
    });

    if (!share) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.categoryShare.delete({ where: { id: shareId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/shares/incoming/${shareId}`, error);
    return NextResponse.json({ error: "Failed to untrack" }, { status: 503 });
  }
}

