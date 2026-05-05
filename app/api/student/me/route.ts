import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const student = await prisma.student.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        user: true,       
        faculty: true,     
        school: true,      
        department: true,  
      },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,

      faculty: student.faculty
        ? {
            name: student.faculty.name,
          }
        : null,

      school: student.school
        ? {
            id: student.school.id,
            name: student.school.name,
          }
        : null,

      department: student.department
        ? {
            id: student.department.id,
            name: student.department.name,
          }
        : null,
    });

  } catch (error) {
    console.error("STUDENT ME ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}