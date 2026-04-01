import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  RoleType,
  ApprovalStatus,
  ClearanceStatus,
} from "@prisma/client";


function isParallelRole(role: RoleType) {
  return role === RoleType.LIBRARY || role === RoleType.FINANCE;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId: session.user.id },
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

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 403 }
      );
    }

    const roleNames = staff.user.roles.map((r) => r.role.name);

    const approvals = await prisma.clearanceApproval.findMany({
      where: {
        role: {
          name: { in: roleNames },
        },
        status: ApprovalStatus.PENDING,

        clearanceRequest: {
          currentStep: { in: roleNames },
          status: { not: ClearanceStatus.REJECTED },
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
        role: true,
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
  } catch (err: any) {
    console.error("GET ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId: session.user.id },
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

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 403 }
      );
    }

    const roleNames = staff.user.roles.map((r) => r.role.name);

    const { approvalId, status, comment } = await req.json();

    const approval = await prisma.clearanceApproval.findUnique({
      where: { id: approvalId },
      include: {
        role: true,
        clearanceRequest: {
          include: {
            approvals: {
              include: { role: true },
            },
            student: true,
          },
        },
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const request = approval.clearanceRequest;

    if (!roleNames.includes(approval.role.name)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    if (status === "REJECTED") {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: {
          status: ClearanceStatus.REJECTED,
        },
      });

      return NextResponse.json({
        message: "Request rejected successfully",
      });
    }


    let nextStep: RoleType | null = null;

    if (approval.role.name === RoleType.ADVISOR) {
      nextStep = RoleType.DEPARTMENT_HEAD;
    }

    else if (approval.role.name === RoleType.DEPARTMENT_HEAD) {
      nextStep = RoleType.ADMIN; 
    }

    else if (approval.role.name === RoleType.ADMIN) {
      nextStep = RoleType.LIBRARY;
    }

    else if (isParallelRole(approval.role.name)) {
      const parallel = request.approvals.filter((a) =>
        isParallelRole(a.role.name)
      );

      const allApproved = parallel.every(
        (a) =>
          a.status === ApprovalStatus.APPROVED ||
          a.id === approvalId
      );

      if (allApproved) {
        nextStep = RoleType.REGISTRAR;
      }
    }

    else if (approval.role.name === RoleType.REGISTRAR) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: {
          status: ClearanceStatus.APPROVED,
        },
      });

      return NextResponse.json({
        message: "Clearance completed 🎉",
      });
    }

    if (nextStep) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: {
          currentStep: nextStep,
          status: ClearanceStatus.IN_PROGRESS,
        },
      });
    }

    return NextResponse.json({
      message: "Approval processed successfully",
    });
  } catch (err: any) {
    console.error("PATCH ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}