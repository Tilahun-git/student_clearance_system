import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Faculty name is required" }, { status: 400 });
    }

    const existing = await prisma.faculty.findFirst({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: "Faculty already exists" }, { status: 400 });
    }

    const faculty = await prisma.faculty.create({
      data: { name },
    });

    return NextResponse.json(faculty);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 });
  }
}