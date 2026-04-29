import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const studentRole = await prisma.role.findUnique({
      where: { name: "STUDENT" },
    });

    if (!studentRole) {
      return NextResponse.json(
        { error: "STUDENT role not found in DB" },
        { status: 404 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        roles: {
          none: {
            roleId: studentRole.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        staffProfile: true,
        studentProfile: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const staffs = await prisma.staff.findMany({
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
        department: true,
        school: true,
        faculty: true,
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json({
      users,
      staffs,
    });
  } catch (error) {
    console.error("USERS API ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}