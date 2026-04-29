import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let roleName = searchParams.get("role");

    console.log("role is:", roleName);

    // ================= NO ROLE FILTER =================
    if (!roleName) {
      const staffs = await prisma.staff.findMany({
        include: {
          user: true,
          department: true,
          faculty: true,
          school: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: staffs,
      });
    }

    // ================= NORMALIZE ROLE =================
    roleName = roleName.trim().toUpperCase();

    // ================= FILTERED QUERY (BEST WAY) =================
    const staffs = await prisma.staff.findMany({
      where: {
        user: {
          roles: {
            some: {
              role: {
                name: roleName, // 🔥 direct relation filter
              },
            },
          },
        },
      },
      include: {
        user: true,
        department: true,
        faculty: true,
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