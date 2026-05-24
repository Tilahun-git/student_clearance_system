import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus, ClearanceStatus } from "@prisma/client";
import { Reasons } from "@/lib/constants/reasons";
import { canStudentSubmitClearanceRequest } from "@/lib/clearance/requestEligibility";

const DISPLAY_ORDER = [
  "ADVISOR", "DEPARTMENT_HEAD", "SCHOOL_DEAN",
  "LIBRARY", "CAFETERIA", "CAMPUS_POLICE", "DORMITORY",
  "STUDENT_DEAN", "REGISTRAR",
] as const;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const student = await prisma.student.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const latestRequest = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        approvals: {
          include: {
            role: true,
          },
        },
      },
    });

    const canRequest = await canStudentSubmitClearanceRequest(student.id);

    if (!latestRequest) {
      return NextResponse.json({
        approvals: [],
        requestStatus: null,
        canRequest,
        approvedCount: 0,
        totalCount: 0,
        rejections: 0,
        clearanceType: "—",
        previousReason: null,
      });
    }

    type ApprovalDTO = { role: string; status: string; comment: string | null };

    const approvals: ApprovalDTO[] = latestRequest.approvals.map((approval) => ({
      role: approval.role.name as string,
      status: approval.status as string,
      comment: approval.comment,
    }));

    const existingRoles = new Set<string>(approvals.map((a) => a.role));
    for (const role of DISPLAY_ORDER) {
      if (!existingRoles.has(role)) {
        approvals.push({ role, status: ApprovalStatus.WAITING, comment: null });
      }
    }

    approvals.sort(
      (a, b) => DISPLAY_ORDER.indexOf(a.role as typeof DISPLAY_ORDER[number]) - DISPLAY_ORDER.indexOf(b.role as typeof DISPLAY_ORDER[number]),
    );

    const approvedCount = approvals.filter((a) => a.status === "APPROVED").length;
    const totalCount = approvals.length;
    const rejections = approvals.filter((a) => a.status === "REJECTED").length;
    const clearanceType =
      Reasons.find((r) => r.id === latestRequest.reason)?.name ||
      latestRequest.reason ||
      "—";

    return NextResponse.json({
      approvals,
      requestStatus: latestRequest.status,
      canRequest,
      approvedCount,
      totalCount,
      rejections,
      clearanceType,
      previousReason: latestRequest.reason ?? null,
    });
  } catch (err) {
    console.error("CLEARANCE PROGRESS ERROR:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch clearance progress",
      },
      { status: 500 }
    );
  }
}