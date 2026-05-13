import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await context.params;

  const student = await prisma.student.findUnique({
    where: {
      studentId,
    },
    select: {
      firstName: true,
      middleName: true,
      studentId: true,
    },
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(student);
}