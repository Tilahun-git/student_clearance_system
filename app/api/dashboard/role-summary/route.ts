import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus, RoleType } from "@prisma/client";

const VALID_ROLES = new Set(["DEPARTMENT_HEAD", "SCHOOL_DEAN"]);

function getStartOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  if (!role || !VALID_ROLES.has(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const staff = await prisma.staff.findUnique({
    where: { userId: session.user.id },
    include: {
      department: {
        include: {
          school: true,
          _count: { select: { students: true } },
        },
      },
      school: true,
    },
  });

  if (!staff) {
    return NextResponse.json({ error: "Staff profile not found" }, { status: 404 });
  }

  const startOfToday = getStartOfToday();

  if (role === "DEPARTMENT_HEAD") {
    if (!staff.departmentId) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const pendingRequests = await prisma.clearanceApproval.count({
      where: {
        role: { name: RoleType.DEPARTMENT_HEAD },
        status: ApprovalStatus.PENDING,
        clearanceRequest: { student: { departmentId: staff.departmentId } },
      },
    });

    const approvedToday = await prisma.clearanceApproval.count({
      where: {
        role: { name: RoleType.DEPARTMENT_HEAD },
        status: ApprovalStatus.APPROVED,
        approvedAt: { gte: startOfToday },
        clearanceRequest: { student: { departmentId: staff.departmentId } },
      },
    });

    const totalHandled = await prisma.clearanceApproval.count({
      where: {
        role: { name: RoleType.DEPARTMENT_HEAD },
        status: { in: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] },
        clearanceRequest: { student: { departmentId: staff.departmentId } },
      },
    });

    return NextResponse.json({
      entityName: staff.department?.name ?? "Department",
      schoolName: staff.department?.school?.name ?? null,
      activeStudents: staff.department?._count.students ?? 0,
      pendingRequests,
      approvedToday,
      totalHandled,
    });
  }

  if (!staff.schoolId) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const school = await prisma.school.findUnique({
    where: { id: staff.schoolId },
    include: { _count: { select: { students: true } } },
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const pendingRequests = await prisma.clearanceApproval.count({
    where: {
      role: { name: RoleType.SCHOOL_DEAN },
      status: ApprovalStatus.PENDING,
      clearanceRequest: { student: { schoolId: staff.schoolId } },
    },
  });

  const approvedToday = await prisma.clearanceApproval.count({
    where: {
      role: { name: RoleType.SCHOOL_DEAN },
      status: ApprovalStatus.APPROVED,
      approvedAt: { gte: startOfToday },
      clearanceRequest: { student: { schoolId: staff.schoolId } },
    },
  });

  const totalHandled = await prisma.clearanceApproval.count({
    where: {
      role: { name: RoleType.SCHOOL_DEAN },
      status: { in: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] },
      clearanceRequest: { student: { schoolId: staff.schoolId } },
    },
  });

  return NextResponse.json({
    entityName: school.name,
    schoolName: null,
    activeStudents: school._count.students,
    pendingRequests,
    approvedToday,
    totalHandled,
  });
}
