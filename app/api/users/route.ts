import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: {
                not: RoleType.STUDENT, 
              },
            },
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