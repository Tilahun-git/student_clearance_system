import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const roleName = searchParams.get("role");

    // validate role
    if (!roleName || !(roleName in RoleType)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({
      where: {
        name: roleName as RoleType,
      },
    });

    if (!role) {
      return NextResponse.json([]);
    }

    const advisors = await prisma.staff.findMany({
      where: {
        user: {
          roles: {
            some: {
              roleId: role.id,
            },
          },
        },
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(advisors);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch advisors" },
      { status: 500 }
    );
  }
}