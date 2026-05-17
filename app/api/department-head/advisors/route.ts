import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RoleType } from "@prisma/client";

// GET — fetch advisors in the same department as the authenticated dept head
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve the dept head's staff record to get their departmentId
    const deptHeadStaff = await prisma.staff.findUnique({
      where: { userId: session.user.id },
      select: { departmentId: true },
    });

    if (!deptHeadStaff?.departmentId) {
      return NextResponse.json(
        { error: "No department assigned to this staff member" },
        { status: 400 },
      );
    }

    // Fetch only advisors assigned to the same department as the dept head
    const advisors = await prisma.staff.findMany({
      where: {
        departmentId: deptHeadStaff.departmentId,
        user: {
          roles: { some: { role: { name: RoleType.ADVISOR } } },
        },
      },
      include: { user: true },
    });

    return NextResponse.json({ success: true, data: advisors });
  } catch (error: any) {
    console.error("FETCH ADVISORS ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch advisors" }, { status: 500 });
  }
}

// POST — assign an advisor to one or more students
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentIds, advisorId } = await req.json();

    if (!studentIds?.length || !advisorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const advisor = await prisma.staff.findUnique({
      where: { id: advisorId },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });
    if (!advisor) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    const hasAdvisorRole = advisor.user.roles.some((r) => r.role.name === "ADVISOR");
    if (!hasAdvisorRole) {
      return NextResponse.json({ error: "Selected staff is not an advisor" }, { status: 400 });
    }

    await prisma.student.updateMany({
      where: { studentId: { in: studentIds } },
      data: { advisorId },
    });

    return NextResponse.json({
      success: true,
      message: `Advisor assigned to ${studentIds.length} student(s) successfully`,
    });
  } catch (error: any) {
    console.error("ASSIGN ADVISOR ERROR:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
