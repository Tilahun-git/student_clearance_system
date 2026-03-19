import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const facultyId = url.searchParams.get("facultyId");

    const schools = await prisma.school.findMany({
      where: facultyId ? { facultyId } : {},
    });

    return NextResponse.json(schools);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}