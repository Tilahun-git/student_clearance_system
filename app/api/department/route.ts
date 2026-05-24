import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(req.url);
    const schoolId = url.searchParams.get("schoolId");

    const departments = await prisma.department.findMany({
      where: schoolId ? { schoolId } : {},
      include: {
        school: { select: { name: true } },
        head:   { include: { user: { select: { name: true } } } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}