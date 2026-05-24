import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ role: string }> }
) {
  const { role } = await context.params;
  const { searchParams } = new URL(req.url);

  const schoolId = searchParams.get("schoolId") || undefined;
  const departmentId = searchParams.get("departmentId") || undefined;

  const normalizedRole = role.toUpperCase();

  if (!Object.values(RoleType).includes(normalizedRole as RoleType)) {
    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  }

  const staff = await prisma.staff.findMany({
    where: {
      ...(schoolId ? { schoolId } : {}),
      ...(departmentId ? { departmentId } : {}),
      user: {
        isActive: true,
        roles: {
          some: {
            role: { name: normalizedRole as RoleType },
          },
        },
      },
    },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
        },
      },
      department: { select: { name: true } },
      school: { select: { name: true } },
    },
  });

  return NextResponse.json(staff);
}