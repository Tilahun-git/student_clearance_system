import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const userRoles: string[] = session?.user?.roles || [];

    const isRegistrar = userRoles.includes("REGISTRAR");

    if (!isRegistrar) {
      return NextResponse.json(
        { error: "Unauthorized - Registrar only" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const student = await prisma.student.create({
      data: {
        studentId: body.studentId,
        firstName: body.firstName,
        middleName: body.middleName,
        lastName: body.lastName,
        program: body.program,
        year: Number(body.year),
        facultyId: body.facultyId,
        schoolId: body.schoolId,
        departmentId: body.departmentId,
      },
    });

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error: any) {
    console.error("REGISTER STUDENT ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to register student" },
      { status: 500 }
    );
  }
}