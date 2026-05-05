import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ApprovalStatus, ClearanceStatus } from "@prisma/client";
import { getNextRole } from "@/lib/workflow";
import { sendNotification } from "@/lib/notify";

export async function POST(req: Request) {
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roleNames = staff.user.roles.map((r) => r.role.name);

  const { ids } = await req.json();

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  // 🔥 Fetch all approvals at once
  const approvals = await prisma.clearanceApproval.findMany({
    where: {
      id: { in: ids },
      status: ApprovalStatus.PENDING,
    },
    include: {
      role: true,
      clearanceRequest: {
        include: { student: true },
      },
    },
  });

  let successCount = 0;

  for (const approval of approvals) {
    // 🔐 Role check
    if (!roleNames.includes(approval.role.name)) continue;

    const request = approval.clearanceRequest;
    const roleName = approval.role.name;

    // ✅ Approve
    await prisma.clearanceApproval.update({
      where: { id: approval.id },
      data: {
        status: ApprovalStatus.APPROVED,
        staffId: staff.id,
        approvedAt: new Date(),
      },
    });

    // 🔁 Same logic as your PATCH (IMPORTANT)
    const roleApprovals = await prisma.clearanceApproval.findMany({
      where: {
        clearanceRequestId: request.id,
        role: { name: roleName },
      },
    });

    const allApproved = roleApprovals.every(
      (a) => a.status === ApprovalStatus.APPROVED
    );

    if (allApproved) {
      const nextRole = getNextRole(roleName);

      if (!nextRole) {
        await prisma.clearanceRequest.update({
          where: { id: request.id },
          data: { status: ClearanceStatus.APPROVED },
        });

        await sendNotification({
          userId: request.student.userId!,
          message: "Clearance fully approved",
        });
      } else {
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
                some: { role: { name: nextRole } },
              },
            },
          },
        });

        for (const s of nextStaff) {
          await sendNotification({
            userId: s.userId,
            message: `${nextRole} has got new clearance request`,
          });
        }

        await sendNotification({
          userId: request.student.userId!,
          message: `${roleName} approved your request`,
        });

        await prisma.clearanceRequest.update({
          where: { id: request.id },
          data: { status: ClearanceStatus.IN_PROGRESS },
        });
      }
    }

    successCount++;
  }

  return NextResponse.json({
    message: `${successCount} approvals processed`,
  });
}