import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    if (!staff.departmentId) {
      return NextResponse.json(
        { error: "Department not assigned" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);

    const section = searchParams.get("section");

    const students = await prisma.student.findMany({
      where: {
        section: section || undefined,

        departmentId: staff.departmentId,
      },

      include: {
        advisor: {
          include: {
            user: true,
          },
        },
      },

      orderBy: {
        firstName: "asc",
      },
    });


    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error(
      "FETCH STUDENTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch students",
      },
      {
        status: 500,
      }
    );
  }
}