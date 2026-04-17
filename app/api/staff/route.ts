import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const staffs = await prisma.staff.findMany({
      where: role
        ? {
            user: {
              roles: {
                some: {
                  role: {
                    name: role as RoleType,
                  },
                },
              },
            },
          }
        : {},
      include: {
        user: true,
      },
    });

    return NextResponse.json(staffs);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}