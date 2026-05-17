import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
