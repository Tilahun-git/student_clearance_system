import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus, ClearanceStatus, RoleType } from "@prisma/client";
import { Reasons } from "@/lib/constants/reasons";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const roles = session?.user?.roles ?? [];
    const isStudent = roles.includes("STUDENT");

    if (!isStudent && session?.user?.id) {
      const staff = await prisma.staff.findUnique({
        where: { userId: session.user.id },
      });

      const pendingCount = staff
        ? await prisma.clearanceApproval.count({
            where: {
              status: ApprovalStatus.PENDING,
              role: { name: { in: roles as RoleType[] } },
            },
          })
        : 0;

      const approvedToday = staff
        ? await prisma.clearanceApproval.count({
            where: {
              staffId: staff.id,
              status: ApprovalStatus.APPROVED,
              approvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
          })
        : 0;

      const totalHandled = staff
        ? await prisma.clearanceApproval.count({
            where: {
              staffId: staff.id,
              status: { in: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] },
            },
          })
        : 0;

      return NextResponse.json({
        role: "STAFF",
        pendingCount,
        approvedToday,
        totalHandled,
      });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ role: "STUDENT", requestStatus: null, approvedSteps: 0, totalSteps: 0, rejections: 0, clearanceType: "—" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ role: "STUDENT", requestStatus: null, approvedSteps: 0, totalSteps: 0, rejections: 0, clearanceType: "—" });
    }

    const latestRequest = await prisma.clearanceRequest.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: {
        approvals: { include: { role: true } },
      },
    });

    if (!latestRequest) {
      return NextResponse.json({
        role: "STUDENT",
        requestStatus: "NOT_STARTED",
        approvedSteps: 0,
        totalSteps: 0,
        rejections: 0,
        clearanceType: "—",
      });
    }

    const approvedSteps = latestRequest.approvals.filter(
      (a) => a.status === ApprovalStatus.APPROVED,
    ).length;

    const rejections = latestRequest.approvals.filter(
      (a) => a.status === ApprovalStatus.REJECTED,
    ).length;

    const totalSteps = latestRequest.approvals.length;

    const reasonLabel =
      Reasons.find((r) => r.id === latestRequest.reason)?.name ||
      latestRequest.reason ||
      "—";

    return NextResponse.json({
      role: "STUDENT",
      requestStatus: latestRequest.status,
      approvedSteps,
      totalSteps,
      rejections,
      clearanceType: reasonLabel,
    });
  } catch (err) {
    console.error("STATUS API ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
