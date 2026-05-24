/**
 * POST /api/super-proctor/assign
 * Assigns (or reassigns) a proctor to one or more students.
 * Body: { studentIds: string[], proctorId: string }
 * Saves the Proctor.id into Student.proctorId.
 * Only accessible by SUPER_PROCTOR.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { RoleType } from "@prisma/client";

export async function POST(req: Request) {
  const auth = await requireAuth(req, [RoleType.SUPER_PROCTOR]);
  if (!auth.ok) return auth.response;

  try {
    const { studentIds, proctorId } = await req.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: "studentIds must be a non-empty array" }, { status: 400 });
    }
    if (!proctorId) {
      return NextResponse.json({ error: "proctorId is required" }, { status: 400 });
    }

    // Verify the proctor exists
    const proctor = await prisma.proctor.findUnique({ where: { id: proctorId } });
    if (!proctor) {
      return NextResponse.json({ error: "Proctor not found" }, { status: 404 });
    }

    // Update all matching students — proctorId on Student references Proctor.id
    const result = await prisma.student.updateMany({
      where: { studentId: { in: studentIds } },
      data: { proctorId },
    });

    return NextResponse.json({
      success: true,
      message: `Proctor assigned to ${result.count} student(s) successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error("ASSIGN_PROCTOR_ERROR", error);
    return NextResponse.json({ error: "Failed to assign proctor" }, { status: 500 });
  }
}
