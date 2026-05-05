import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ClearanceStatus } from "@prisma/client";
import { sendNotification } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const roles = session?.user?.roles ?? [];

    if (!session?.user?.id || !roles.includes("STUDENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile missing" },
        { status: 404 }
      );
    }

    const existing = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        status: {
          not: ClearanceStatus.APPROVED,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have an active request" },
        { status: 400 }
      );
    }

    const clearance = await prisma.clearanceRequest.create({
      data: {
        studentId: student.id,
        facultyId: body.facultyId,
        schoolId: body.schoolId,
        departmentId: body.departmentId,
        reason: body.reason,
        academicYear: body.academicYear,
        semester: body.semester,
        status: ClearanceStatus.PENDING,
      },
    });

    const advisorRole = await prisma.role.findUnique({
      where: { name: "ADVISOR" },
    });

    if (!advisorRole) {
      return NextResponse.json(
        { error: "ADVISOR role not found in DB" },
        { status: 500 }
      );
    }

    await prisma.clearanceApproval.create({
      data: {
        clearanceRequestId: clearance.id,
        roleId: advisorRole.id,
        status: "PENDING",
      },
    });

    const notifications: Promise<any>[] = [];

    // Advisor notification
    if (student.advisorId) {
      const advisor = await prisma.staff.findUnique({
        where: { id: student.advisorId },
      });

      if (advisor?.userId) {
        notifications.push(
          sendNotification({
            userId: advisor.userId,
            message: `New clearance request from ${student.studentId}`,
            referenceId: clearance.id,
          })
        );
      }
    }

    if (student.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: student.departmentId },
        include: { head: true },
      });

      if (department?.head?.userId) {
        notifications.push(
          sendNotification({
            userId: department.head.userId,
            message: `New clearance request awaiting your review`,
            referenceId: clearance.id,
          })
        );
      }
    }

    await Promise.allSettled(notifications);

    return NextResponse.json(clearance, { status: 201 });

  } catch (error: any) {
    console.error("CLEARANCE ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create clearance request" },
      { status: 500 }
    );
  }
}