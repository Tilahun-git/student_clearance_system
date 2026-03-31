import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      studentId,
      firstName,
      middleName,
      lastName,
      program,
      year,
      departmentId,
    } = await req.json();

    if (!studentId || !firstName || !lastName || !departmentId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingStudent = await prisma.student.findUnique({
      where: { studentId },
    });

    if (existingStudent) {
      return Response.json(
        { error: "Student already exists" },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        studentId,
        firstName,
        middleName: middleName || null,
        lastName,
        program,
        year:Number(year),
        departmentId,
      },
    });

    return Response.json(
      {
        message: "Student registered successfully",
        student,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Server error not registered " },
      { status: 500 }
    );
  }
}