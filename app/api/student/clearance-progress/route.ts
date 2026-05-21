import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ClearanceStatus } from "@prisma/client";

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

    const activeRequest = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        status: {
          in: [
            ClearanceStatus.PENDING,
            ClearanceStatus.IN_PROGRESS,
          ],
        },
      },
    });
    const canRequest = !activeRequest;

    if (!latestRequest) {
      return NextResponse.json({
        approvals: [],
        requestStatus: null,
        canRequest: true,
      });
    }

    // Use a plain DTO type so we can push virtual PENDING rows for missing roles
    type ApprovalDTO = { role: string; status: string; comment: string | null };

    const approvals: ApprovalDTO[] = latestRequest.approvals.map((approval) => ({
      role: approval.role.name as string,
      status: approval.status as string,
      comment: approval.comment,
    }));

    // All 9 roles in canonical display order
    const DISPLAY_ORDER = [
      "ADVISOR", "DEPARTMENT_HEAD", "SCHOOL_DEAN",
      "LIBRARY", "CAFETERIA", "CAMPUS_POLICE", "DORMITORY",
      "STUDENT_DEAN", "REGISTRAR",
    ];

    // Fill in any missing roles as PENDING so the student always sees all 9 stages.
    // This handles both old requests (created before the upfront-creation change)
    // and new requests where a role hasn't been reached yet.
    const existingRoles = new Set<string>(approvals.map((a) => a.role));
    for (const role of DISPLAY_ORDER) {
      if (!existingRoles.has(role)) {
        approvals.push({ role, status: "PENDING", comment: null });
      }
    }

    // Sort into canonical display order
    approvals.sort(
      (a, b) => DISPLAY_ORDER.indexOf(a.role) - DISPLAY_ORDER.indexOf(b.role),
    );

    const approvedCount = approvals.filter((a) => a.status === "APPROVED").length;
    const totalCount    = approvals.length; // always 9

    return NextResponse.json({
      approvals,
      requestStatus: latestRequest.status,
      canRequest,
      approvedCount,
      totalCount,
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