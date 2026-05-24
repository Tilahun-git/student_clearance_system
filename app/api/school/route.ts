import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const schools = await prisma.school.findMany({
      include: {
        school_dean: { include: { user: { select: { name: true } } } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error("SCHOOL_FETCH_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}
