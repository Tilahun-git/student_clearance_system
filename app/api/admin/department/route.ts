import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ApprovalStatusEnum } from "@/lib/constants/enums";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId: session.user.id },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 403 }
      );
    }

    if (!staff.departmentId) {
      return NextResponse.json(
        { error: "No department assigned to this staff" },
        { status: 400 }
      );
    }

    const approvals = await prisma.clearanceApproval.findMany({
      where: {
        role: {
          name: "DEPARTMENT_HEAD",
        },
        status: ApprovalStatusEnum.PENDING,
        clearanceRequest: {
          departmentId: staff.departmentId,
        },
      },
      include: {
        role: true,
        clearanceRequest: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        clearanceRequest: {
          createdAt: "desc",
        },
      },
    });

    return NextResponse.json(approvals);
  } catch (error: any) {
    console.error("DEPT HEAD FETCH ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, schoolId, headId } = await req.json();

    if (!name || !schoolId || !headId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.department.findFirst({
      where: {
        name,
        schoolId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Department already exists in this school" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: { id: headId },
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
        { status: 404 }
      );
    }

    const isDepartmentHead = staff.user.roles.some(
      (r) => r.role?.name === "DEPARTMENT_HEAD" 
    );

    if (!isDepartmentHead) {
      return NextResponse.json(
        { error: "Selected staff is not a Department Head" },
        { status: 400 }
      );
    }

    const existingHead = await prisma.department.findUnique({
  where: { headId },
});

if (existingHead) {
  return NextResponse.json(
    { error: "Already assigned as a department head" },
    { status: 400 }
  );
}
    const department = await prisma.department.create({
      data: {
        name,
        schoolId,
        headId,
      },
    });

    await prisma.staff.update({
      where: { id: headId },
      data: {
        departmentId: department.id,
      },
    });

    return NextResponse.json(department);
  } catch (error: any) {
    console.error("CREATE DEPT ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}