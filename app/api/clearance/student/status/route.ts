import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus, ClearanceStatus, RoleType } from "@prisma/client";
import { Reasons } from "@/lib/constants/reasons";
import { requireAuth } from "@/lib/apiAuth";

const DISPLAY_ORDER = [
  "ADVISOR", "DEPARTMENT_HEAD", "SCHOOL_DEAN",
  "LIBRARY", "CAFETERIA", "CAMPUS_POLICE", "DORMITORY",
  "STUDENT_DEAN", "REGISTRAR",
] as const;

const EMPTY_STUDENT = {
  role: "STUDENT" as const,
  requestStatus: null,
  approvedCount: 0,
  totalCount: 0,
  rejections: 0,
  clearanceType: "—",
};

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

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
      return NextResponse.json(EMPTY_STUDENT);
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(EMPTY_STUDENT);
    }

    const latestRequest = await prisma.clearanceRequest.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: {
        approvals: { include: { role: true } },
      },
    });

    if (!latestRequest) {
      return NextResponse.json(EMPTY_STUDENT);
    }

    const approvals = latestRequest.approvals.map((approval) => ({
      role: approval.role.name as string,
      status: approval.status as string,
    }));

    const existingRoles = new Set(approvals.map((a) => a.role));
    for (const role of DISPLAY_ORDER) {
      if (!existingRoles.has(role)) {
        approvals.push({ role, status: "PENDING" });
      }
    }

    const approvedCount = approvals.filter((a) => a.status === "APPROVED").length;
    const totalCount = approvals.length;
    const rejections = approvals.filter((a) => a.status === "REJECTED").length;
    const clearanceType =
      Reasons.find((r) => r.id === latestRequest.reason)?.name ||
      latestRequest.reason ||
      "—";

    return NextResponse.json({
      role: "STUDENT",
      requestStatus: latestRequest.status,
      approvedCount,
      totalCount,
      rejections,
      clearanceType,
    });
  } catch (err) {
    console.error("STATUS API ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
