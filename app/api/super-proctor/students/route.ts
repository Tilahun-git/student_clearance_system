/**
 * GET /api/super-proctor/students
 * Returns all students with their current proctor assignment.
 * Only accessible by SUPER_PROCTOR.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { RoleType } from "@prisma/client";

export async function GET(req: Request) {
  const auth = await requireAuth(req, [RoleType.SUPER_PROCTOR]);
  if (!auth.ok) return auth.response;

  try {
    const students = await prisma.student.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        studentId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        section: true,
        program: true,
        year: true,
        proctorId: true,
        proctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("FETCH_STUDENTS_FOR_PROCTOR_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
