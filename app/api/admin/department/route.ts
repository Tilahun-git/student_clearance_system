import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, schoolId, headId } = await req.json();

    if (!name || !schoolId || !headId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.department.findFirst({
      where: { name, schoolId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Department already exists in this school" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: { id: headId },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    const isHead = staff.user.roles.some(
      (r) => r.role.name === RoleType.DEPARTMENT_HEAD
    );

    if (!isHead) {
      return NextResponse.json(
        { error: "Selected staff is not a Department Head" },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        schoolId,
        headId,
      },
    });

    return NextResponse.json(department);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}