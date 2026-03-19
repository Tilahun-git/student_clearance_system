import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.roles?.includes(RoleType.STUDENT)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.user.studentId },
    include: {
      clearanceRequests: {
        include: {
          approvals: true,
        },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student.clearanceRequests);
}