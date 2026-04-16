import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { RoleType, ClearanceStatus } from "@prisma/client";
import { sendNotification } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes(RoleType.STUDENT)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    console.log("REQUEST BODY:", body);

    const student = await prisma.student.findUnique({
      where: { studentId: body.studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile missing" },
        { status: 400 }
      );
    }

    console.log("STUDENT:", student);

    if (body.studentId !== student.studentId) {
      return NextResponse.json(
        { error: "Student ID mismatch occurred" },
        { status: 400 }
      );
    }

    const existing = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        status: { not: ClearanceStatus.APPROVED },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have an active request" },
        { status: 400 }
      );
    }

    const dbRoles = await prisma.role.findMany({
      where: {
        name: {
          in: [
            RoleType.ADVISOR,
            RoleType.DEPARTMENT_HEAD,
            RoleType.SCHOOL_DEAN,
            RoleType.LIBRARY,
            RoleType.FINANCE,
            RoleType.REGISTRAR,
          ],
        },
      },
    });

    if (dbRoles.length === 0) {
      return NextResponse.json(
        { error: "Roles not found in database" },
        { status: 500 }
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

        currentStep: RoleType.ADVISOR,

        approvals: {
          create: dbRoles.map((role) => ({
            role: {
              connect: {
                id: role.id, 
              },
            },
          })),
        },
      },
    });

    console.log("CLEARANCE CREATED:", clearance);

    if (!student.advisorId) {
      console.warn("No advisor assigned to student");
    } else {
      const advisor = await prisma.staff.findUnique({
        where: { id: student.advisorId },
      });

      if (advisor) {
        await sendNotification({
          userId: advisor.userId,
          message: `New clearance request from ${student.firstName}`,
        });

      } else {
        console.warn("Advisor not found in staff table");
      }
    }

    return NextResponse.json(clearance, { status: 201 });

  } catch (error) {
    console.error("CLEARANCE ERROR:", error);

    return NextResponse.json(
      { error: "Failed, unable to create clearance request" },
      { status: 500 }
    );
  }
}