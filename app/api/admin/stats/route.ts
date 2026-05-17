import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ClearanceStatus, ApprovalStatus } from "@prisma/client";

export async function GET() {
  try {
    const [
      totalStudents,
      totalSchools,
      totalDepartments,
      totalOffices,
      pendingClearances,
      approvedClearances,
      recentApprovals,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.school.count(),
      prisma.department.count(),
      prisma.clearanceStaffOffice.count(),
      prisma.clearanceRequest.count({ where: { status: ClearanceStatus.PENDING } }),
      prisma.clearanceRequest.count({ where: { status: ClearanceStatus.APPROVED } }),
      prisma.clearanceApproval.findMany({
        where: {
          status: { in: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] },
          approvedAt: { not: null },
        },
        orderBy: { approvedAt: "desc" },
        take: 8,
        select: {
          id: true,
          status: true,
          approvedAt: true,
          role: { select: { name: true } },
          clearanceRequest: {
            select: {
              student: {
                select: { studentId: true, firstName: true, lastName: true },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalStudents,
      totalSchools,
      totalDepartments,
      totalOffices,
      pendingClearances,
      approvedClearances,
      recentActivity: recentApprovals.map((a) => ({
        id: a.id,
        studentId: a.clearanceRequest.student.studentId,
        studentName: `${a.clearanceRequest.student.firstName} ${a.clearanceRequest.student.lastName}`,
        role: a.role.name as string,
        status: a.status as string,
        approvedAt: a.approvedAt,
      })),
    });
  } catch (error) {
    console.error("ADMIN_STATS_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
