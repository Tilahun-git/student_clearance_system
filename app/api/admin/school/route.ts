import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — create school (no dean required at creation time)
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "School name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    const existing = await prisma.school.findFirst({
      where: { name: { equals: trimmedName, mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json({ error: "School already exists" }, { status: 400 });
    }

    const school = await prisma.school.create({
      data: { name: trimmedName },
    });

    return NextResponse.json({ message: "School created successfully", school });
  } catch (error: any) {
    console.error("CREATE SCHOOL ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to create school" }, { status: 500 });
  }
}

// PATCH — assign or reassign school dean
export async function PATCH(req: Request) {
  try {
    const { schoolId, deanId } = await req.json();

    if (!schoolId || !deanId) {
      return NextResponse.json({ error: "schoolId and deanId are required" }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: deanId },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const isDean = staff.user.roles.some((r) => r.role.name as string === "SCHOOL_DEAN");
    if (!isDean) {
      return NextResponse.json({ error: "Selected staff is not a School Dean" }, { status: 400 });
    }

    // Remove dean from their previous school if any
    await prisma.school.updateMany({
      where: { school_deanId: deanId },
      data: { school_deanId: null },
    });

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: { school_deanId: deanId },
    });

    await prisma.staff.update({
      where: { id: deanId },
      data: { schoolId: school.id },
    });

    return NextResponse.json({ message: "Dean assigned successfully", school });
  } catch (error: any) {
    console.error("ASSIGN DEAN ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to assign dean" }, { status: 500 });
  }
}

// DELETE — hard delete a school (only if no students or departments)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const deptCount = await prisma.department.count({ where: { schoolId: id } });
    if (deptCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${deptCount} department(s) belong to this school` },
        { status: 409 },
      );
    }

    const studentCount = await prisma.student.count({ where: { schoolId: id } });
    if (studentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${studentCount} student(s) are assigned to this school` },
        { status: 409 },
      );
    }

    await prisma.school.update({ where: { id }, data: { school_deanId: null } });
    await prisma.school.delete({ where: { id } });

    return NextResponse.json({ message: "School deleted" });
  } catch (error: any) {
    console.error("DELETE SCHOOL ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to delete school" }, { status: 500 });
  }
}
