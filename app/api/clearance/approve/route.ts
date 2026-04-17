import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {
  RoleType,
  ApprovalStatus,
  ClearanceStatus,
} from "@prisma/client";
import { Staff } from "@prisma/client";

import { sendNotification } from "@/lib/notify";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisor = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!advisor) {
      return NextResponse.json(
        { error: "Only advisors allowed" },
        { status: 403 }
      );
    }

    const approvals = await prisma.clearanceApproval.findMany({
      where: {
        role: { name: RoleType.ADVISOR },
        status: ApprovalStatus.PENDING,
        clearanceRequest: {
          currentStep: RoleType.ADVISOR,
          student: {
            advisorId: advisor.id,
          },
        },
      },
      include: {
        clearanceRequest: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: {
        clearanceRequest: {
          createdAt: "desc",
        },
      },
    });

    const formatted = approvals.map((a) => ({
      id: a.id,
      status: a.status,
      comment: a.comment,
      clearanceRequest: {
        id: a.clearanceRequest.id,
        reason: a.clearanceRequest.reason,
        academicYear: a.clearanceRequest.academicYear,
        semester: a.clearanceRequest.semester,
        createdAt: a.clearanceRequest.createdAt,
        student: a.clearanceRequest.student,
      },
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId: session.user.id },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 403 });
    }

    const { approvalId, status, comment } = await req.json();

    const approval = await prisma.clearanceApproval.findUnique({
      where: { id: approvalId },
      include: {
        role: true,
        clearanceRequest: {
          include: {
            student: true, 
          },
        },
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.clearanceApproval.update({
      where: { id: approvalId },
      data: {
        status,
        comment,
        staffId: staff.id,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    const request = approval.clearanceRequest;
    const student = await prisma.student.findUnique({
    where: { id: request.studentId },
    include: { user: true },
  });
    if (status === "REJECTED") {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: {
          status: ClearanceStatus.REJECTED,
        },
      });

      await sendNotification({
        userId: student!.userId!,
        message: `Requst is Rejected by ${approval.role.name}: ${comment}`,
      });

      return NextResponse.json({ message: "Rejected" });
    }


    let nextStep: RoleType | null = null;

    if (approval.role.name === RoleType.ADVISOR) {
      nextStep = RoleType.DEPARTMENT_HEAD;
    } 
    else if (approval.role.name === RoleType.DEPARTMENT_HEAD) {
      nextStep = RoleType.SCHOOL_DEAN;
    } 
    else if (approval.role.name === RoleType.SCHOOL_DEAN) {
      nextStep = RoleType.LIBRARY;
    } 
    else if (
      approval.role.name === RoleType.LIBRARY ||
      approval.role.name === RoleType.FINANCE
    ) {
      const approvals = await prisma.clearanceApproval.findMany({
        where: {
          clearanceRequestId: request.id,
          role: {
            name: { in: [RoleType.LIBRARY, RoleType.FINANCE] },
          },
        },
      });

      const allApproved = approvals.every(
        (a) => a.status === ApprovalStatus.APPROVED
      );

      if (allApproved) {
        nextStep = RoleType.REGISTRAR;
      }
    } 
    else if (approval.role.name === RoleType.REGISTRAR) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: { status: ClearanceStatus.APPROVED },
      });

      await sendNotification({
        userId: student!.userId!,
        message: "🎉 Your clearance is fully approved!",
      });

      return NextResponse.json({ message: "Completed" });
    }

    if (nextStep) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: {
          currentStep: nextStep,
          status: ClearanceStatus.IN_PROGRESS,
        },
      });


let nextStaff: Staff[] = [];
if (nextStep === RoleType.DEPARTMENT_HEAD) {
  nextStaff = await prisma.staff.findMany({
    where: {
      departmentId: request.departmentId,
      user: {
        roles: {
          some: {
            role: {
              name: RoleType.DEPARTMENT_HEAD,
            },
          },
        },
      },
    },
  });
}

else if (nextStep === RoleType.SCHOOL_DEAN) {
  nextStaff = await prisma.staff.findMany({
    where: {
      schoolId: request.schoolId,
      user: {
        roles: {
          some: {
            role: {
              name: RoleType.SCHOOL_DEAN,
            },
          },
        },
      },
    },
  });
}

else if (nextStep === RoleType.LIBRARY || RoleType.FINANCE) {
  nextStaff = await prisma.staff.findMany({
    where: {
      user: {
        roles: {
          some: {
            role: {
              name: nextStep,
            },
          },
        },
      },
    },
  });
}

else if (nextStep === RoleType.REGISTRAR) {
  nextStaff = await prisma.staff.findMany({
    where: {
      user: {
        roles: {
          some: {
            role: {
              name: RoleType.REGISTRAR,
            },
          },
        },
      },
    },
  });
}

      for (const s of nextStaff) {
        await sendNotification({
          userId: s.userId,
          message: `New clearance request waiting for ${nextStep}`,
        });
      }
    }

    await sendNotification({
      userId: student!.userId!,
      message: `Approved by ${approval.role.name}`,
    });

    return NextResponse.json({ message: "Updated" });

  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}