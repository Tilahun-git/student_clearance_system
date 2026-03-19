import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      userId,
      studentId,
      program,
      year,
      departmentId,
      advisorId,
    } = await req.json();

    // ✅ Validation
    if (!userId || !studentId || !departmentId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Ensure user exists and is STUDENT
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const hasStudentRole = user.roles.some(
      (r) => r.role.name === "STUDENT"
    );

    if (!hasStudentRole) {
      return Response.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // ✅ Prevent duplicate studentId
    const exists = await prisma.student.findUnique({
      where: { studentId },
    });

    if (exists) {
      return Response.json(
        { error: "Student already exists" },
        { status: 400 }
      );
    }

    // ✅ Create student
    const student = await prisma.student.create({
      data: {
        userId,
        studentId,
        program,
        year,
        departmentId,
        advisorId,
      },
    });

    return Response.json({
      message: "Student registered successfully",
      student,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}