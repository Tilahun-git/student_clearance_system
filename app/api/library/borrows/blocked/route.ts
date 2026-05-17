import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/library/borrows/blocked
 * Returns the set of student IDs (the studentId string, e.g. "WDU23001")
 * that have at least one unreturned borrow record added by this library manager.
 * Used by the approval table to disable the Approve button per row.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ blockedIds: [] }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({ where: { userId: session.user.id } });
    if (!staff) return NextResponse.json({ blockedIds: [] });

    const unreturned = await prisma.libraryBorrow.findMany({
      where: { addedBy: staff.id, returned: false },
      select: { student: { select: { studentId: true } } },
    });

    const blockedIds = unreturned.map((b) => b.student.studentId);
    return NextResponse.json({ blockedIds });
  } catch (error) {
    console.error("LIBRARY_BLOCKED_ERROR", error);
    return NextResponse.json({ blockedIds: [] });
  }
}
