import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, advisorId } = body;

    if (!studentId || !advisorId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (student.advisorId) {
      return NextResponse.json(
        { error: "Student already has an advisor" },
        { status: 409 }
      );
    }

    const advisor = await prisma.staff.findUnique({
      where: { id: advisorId },
      include: {
        user: {
          include: {
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!advisor) {
      return NextResponse.json(
        { error: "Advisor not found" },
        { status: 404 }
      );
    }

    const hasAdvisorRole = advisor.user.roles.some(
      (r) => r.role.name === "ADVISOR"
    );

    if (!hasAdvisorRole) {
      return NextResponse.json(
        { error: "Selected staff is not an advisor" },
        { status: 400 }
      );
    }

    await prisma.student.update({
      where: { studentId },
      data: {
        advisorId: advisor.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Advisor assigned successfully",
    });

  } catch (err: any) {
    console.error("ASSIGN ADVISOR ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}