import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, facultyId, deanId } = await req.json();

    if (!name || !facultyId || !deanId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    const existing = await prisma.school.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        facultyId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "School already exists in this faculty" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: { id: deanId },
      include: {
        user: {
          include: {
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Dean not found" },
        { status: 404 }
      );
    }

    const isDean = staff.user.roles.some(
      (r) => r.role.name === RoleType.SCHOOL_DEAN
    );

    if (!isDean) {
      return NextResponse.json(
        { error: "Selected staff is not a School Dean" },
        { status: 400 }
      );
    }

    const school = await prisma.school.create({
      data: {
        name: trimmedName,
        facultyId,
        deanId,
      },
    });

    return NextResponse.json(school);
  } catch (error: any) {
    console.error("CREATE SCHOOL ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create school" },
      { status: 500 }
    );
  }
}