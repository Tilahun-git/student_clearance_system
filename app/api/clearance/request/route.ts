import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { RoleType, ClearanceStatus } from "@prisma/client";
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes(RoleType.STUDENT)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
    }

    const body = await req.json();

    // 🚫 prevent duplicate active request
    const existing = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        status: { not: ClearanceStatus.APPROVED },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have an active clearance request" },
        { status: 400 }
      );
    }

    // ✅ CREATE REQUEST WITH RELATIONS
    const clearance = await prisma.clearanceRequest.create({
      data: {
        studentId: student.id,
        facultyId: body.facultyId,
        schoolId: body.schoolId,
        departmentId: body.departmentId,
        reason: body.reason,
        academicYear: body.academicYear,
        semester: body.semester,

        approvals: {
          create: [
            { role: { connect: { name: RoleType.ADVISOR } } },
            { role: { connect: { name: RoleType.DEPARTMENT_HEAD } } },
            { role: { connect: { name: RoleType.LIBRARY } } },
            { role: { connect: { name: RoleType.FINANCE } } },
            { role: { connect: { name: RoleType.REGISTRAR } } },
          ],
        },
      },
      include: { approvals: true },
    });

    return NextResponse.json(clearance, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}