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
      facultyId,
      schoolId,
      departmentId,
    } = await req.json();



    if (!studentId || !firstName || !lastName || !departmentId || !facultyId || !schoolId) {
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
    studentId: studentId,
    firstName: firstName,
    middleName: middleName || null,
    lastName: lastName,
    program: program,
    year: Number(year),
    facultyId: facultyId,
    schoolId: schoolId,
    departmentId: departmentId,
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