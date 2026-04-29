import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ApprovalStatus, ClearanceStatus } from "@prisma/client";
import {
  getNextRole,
} from "@/lib/workflow";
import { sendNotification } from "@/lib/notify";


export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
        },
      },
    },
  });

  if (!staff) {
    return NextResponse.json({ error: "Not found" }, { status: 403 });
  }

  const roleNames = staff.user.roles.map(r => r.role.name);

  const approvals = await prisma.clearanceApproval.findMany({
    where: {
      role: {
        name: { in: roleNames },
      },
      status: ApprovalStatus.PENDING,
    },
    include: {
      role: true,
      clearanceRequest: {
        include: {
          student: true,
        },
      },
    },
    orderBy: {
      approvedAt: "desc",
    },
  });

  return NextResponse.json(approvals);
}


export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findUnique({
    where: { userId: session.user.id },
  });

  if (!staff) {
    return NextResponse.json({ error: "Not found" }, { status: 403 });
  }

  const { approvalId, status, comment } = await req.json();

  const approval = await prisma.clearanceApproval.findUnique({
    where: { id: approvalId },
    include: {
      role: true,
      clearanceRequest: {
        include: { student: true },
      },
    },
  });

  if (!approval) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const request = approval.clearanceRequest;
  const roleName = approval.role.name;

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
      data: { status: ClearanceStatus.REJECTED },
    });

    await sendNotification({
      userId: request.student.userId!,
      message: `Rejected at ${roleName}`,
    });

    return NextResponse.json({ message: "Rejected" });
  }


  const roleApprovals = await prisma.clearanceApproval.findMany({
    where: {
      clearanceRequestId: request.id,
      role: { name: roleName },
    },
  });

  const allApproved = roleApprovals.every(
    (a) => a.status === "APPROVED"
  );

  if (!allApproved) {
    return NextResponse.json({ message: "Waiting for others" });
  }

  const nextRole = getNextRole(roleName);

  if (!nextRole) {
    await prisma.clearanceRequest.update({
      where: { id: request.id },
      data: { status: ClearanceStatus.APPROVED },
    });

    await sendNotification({
      userId: request.student.userId!,
      message: "🎉 Clearance fully approved",
    });

    return NextResponse.json({ message: "Completed" });
  }

  const nextRoleData = await prisma.role.findUnique({
    where: { name: nextRole },
  });

  if (nextRoleData) {
    await prisma.clearanceApproval.upsert({
      where: {
        clearanceRequestId_roleId: {
          clearanceRequestId: request.id,
          roleId: nextRoleData.id,
        },
      },
      update: {},
      create: {
        clearanceRequestId: request.id,
        roleId: nextRoleData.id,
        status: ApprovalStatus.PENDING,
      },
    });
  }

  const nextStaff = await prisma.staff.findMany({
    where: {
      user: {
        roles: {
          some: {
            role: { name: nextRole },
          },
        },
      },
    },
  });

  for (const s of nextStaff) {
    await sendNotification({
      userId: s.userId,
      message: `New clearance request assigned to ${nextRole}`,
    });
  }

  await prisma.clearanceRequest.update({
    where: { id: request.id },
    data: {
      status: ClearanceStatus.IN_PROGRESS,
    },
  });

  return NextResponse.json({ message: "Updated" });
}