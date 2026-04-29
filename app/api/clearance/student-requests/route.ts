import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const roles = session?.user?.roles ?? [];

    // ✅ FIX: no RoleType enum usage
    if (!session?.user?.id || !roles.includes("STUDENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.studentId) {
      return NextResponse.json(
        { error: "Missing student profile link" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { studentId: session.user.studentId },
      include: {
        clearanceRequests: {
          include: {
            approvals: {
              include: {
                role: true,
                staff: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student.clearanceRequests);
  } catch (error: any) {
    console.error("STUDENT CLEARANCE FETCH ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}