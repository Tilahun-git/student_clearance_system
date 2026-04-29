import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleName = searchParams.get("role");

    let whereClause: any = {};

    if (roleName) {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        return NextResponse.json(
          { error: "Role not found in database" },
          { status: 404 }
        );
      }

      whereClause = {
        user: {
          roles: {
            some: {
              roleId: role.id,
            },
          },
        },
      };
    }

    const staffs = await prisma.staff.findMany({
      where: whereClause,
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
        faculty: true,
        school: true,
      },
    });

    return NextResponse.json(staffs);
  } catch (error) {
    console.error("STAFF FETCH ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}