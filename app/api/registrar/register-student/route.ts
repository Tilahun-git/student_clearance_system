import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function generateStudentId() {
  const gregorianYear = new Date().getFullYear();
  const ethiopianYear = gregorianYear - 8; 
  const yearCode = String(ethiopianYear).slice(-2);
  const count = await prisma.student.count({
    where: {
      studentId: {
      startsWith: `WDU${yearCode}`,
      },
    },
  });
  const sequence = String(count + 1).padStart(3, "0");
  return `WDU${yearCode}${sequence}`;
}

// register student POST  endpoint 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles: string[] = session?.user?.roles || [];
    if (!userRoles.includes("REGISTRAR")) {
      return NextResponse.json(
        { error: "Unauthorized - Registrar only" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const studentId = await generateStudentId();
    const student = await prisma.student.create({
      data: {
        studentId,
        firstName: body.firstName,
        middleName: body.middleName,
        lastName: body.lastName,
        program: body.program,
        year: Number(body.year),
        facultyId: body.facultyId,
        schoolId: body.schoolId,
        departmentId: body.departmentId,
        section: body.section?.trim() || "A", 
      },
    });
    return NextResponse.json({
      success: true,
      student,
    });

    console.log("registered student is : ", student)
  } catch (error: any) {
    console.error("REGISTER STUDENT ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register student" },
      { status: 500 }
    );
  }
}