import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus, RoleType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireAuth } from "@/lib/apiAuth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({ where: { userId: session.user.id } });
    if (!staff) { 
      return NextResponse.json({ error: "Staff not found" }, { status: 403 });
    }
    if (!staff.departmentId) {
      return NextResponse.json({ error: "No department assigned to this staff" }, { status: 400 });
    }

    const approvals = await prisma.clearanceApproval.findMany({
      where: {
        role: { name: RoleType.DEPARTMENT_HEAD },
        status: ApprovalStatus.PENDING,
        clearanceRequest: { departmentId: staff.departmentId },
      },
      include: {
        role: true,
        clearanceRequest: {
          include: { student: { include: { user: true } } },
        },
      },
      orderBy: { clearanceRequest: { createdAt: "desc" } },
    });

    return NextResponse.json(approvals);
  } catch (error: any) {
    console.error("DEPT HEAD FETCH ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch requests" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const { name, schoolId } = await req.json();

    if (!name || !schoolId) {
      return NextResponse.json({ error: "Name and school are required" }, { status: 400 });
    }

    const existing = await prisma.department.findFirst({ where: { name, schoolId } });
    if (existing) {
      return NextResponse.json(
        { error: "Department already exists in this school" },
        { status: 400 },
      );
    }

    const department = await prisma.department.create({ data: { name, schoolId } });
    return NextResponse.json(department);
  } catch (error: any) {
    console.error("CREATE DEPT ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create department" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const { departmentId, headId } = await req.json();

    if (!departmentId || !headId) {
      return NextResponse.json({ error: "departmentId and headId are required" }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: headId },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const isDepartmentHead = staff.user.roles.some(
      (r) => r.role.name as string === "DEPARTMENT_HEAD",
    );
    if (!isDepartmentHead) {
      return NextResponse.json(
        { error: "Selected staff is not a Department Head" },
        { status: 400 },
      );
    }

    await prisma.department.updateMany({
      where: { headId },
      data: { headId: null },
    });

    const department = await prisma.department.update({
      where: { id: departmentId },
      data: { headId },
    });

    await prisma.staff.update({
      where: { id: headId },
      data: { departmentId: department.id },
    });

    return NextResponse.json({ message: "Head assigned successfully", department });
  } catch (error: any) {
    console.error("ASSIGN HEAD ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign head" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const studentCount = await prisma.student.count({ where: { departmentId: id } });
    if (studentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${studentCount} student(s) are assigned to this department` },
        { status: 409 },
      );
    }

    await prisma.department.update({ where: { id }, data: { headId: null } });
    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ message: "Department deleted" });
  } catch (error: any) {
    console.error("DELETE DEPT ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to delete department" }, { status: 500 });
  }
}
