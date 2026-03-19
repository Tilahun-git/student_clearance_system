import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, facultyId } = await req.json();

    if (!name || !facultyId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.school.findFirst({
      where: { name, facultyId },
    });

    if (existing) {
      return NextResponse.json({ error: "School already exists in this faculty" }, { status: 400 });
    }

    const school = await prisma.school.create({
      data: {
        name,
        facultyId,
      },
    });

    return NextResponse.json(school);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
  }
}