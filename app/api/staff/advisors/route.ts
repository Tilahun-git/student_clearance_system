import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, [RoleType.ADMIN, RoleType.DEPARTMENT_HEAD]);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);

    const roleName = searchParams.get("role");

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