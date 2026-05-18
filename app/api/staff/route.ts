import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let roleName = searchParams.get("role");

    console.log("role is:", roleName);

    if (!roleName) {
      const staffs = await prisma.staff.findMany({
        include: {
          user: true,
          department: true,
          school: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: staffs,
      });
    }

    roleName = roleName.trim().toUpperCase();
    const staffs = await prisma.staff.findMany({
      where: {
        user: {
          roles: {
            some: {
              role: {
                name: roleName as RoleType, 
              },
            },
          },
        },
      },
      include: {
        user: true,
        department: true,
        school: true,
      },
    });

    console.log("filtered staff:", staffs);

    return NextResponse.json({
      success: true,
      data: staffs,
    });

  } catch (error) {
    console.error("STAFF API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch staff",
      },
      { status: 500 }
    );
  }
}