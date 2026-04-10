import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, schoolId } = await req.json();

    if (!name || !schoolId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.department.findFirst({
      where: { name, schoolId },
    });

    if (existing) {
      return NextResponse.json({ error: "Department already exists in this school" }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name,
        schoolId,
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}