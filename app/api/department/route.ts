import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const schoolId = url.searchParams.get("schoolId");

    const departments = await prisma.department.findMany({
      where: schoolId ? { schoolId } : {},
    });

    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}