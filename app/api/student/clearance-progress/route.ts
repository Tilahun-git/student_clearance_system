import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const request = await prisma.clearanceRequest.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: {
        approvals: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json([]);
    }
    const result = request.approvals.map((a) => ({
      role: a.role.name,
      status: a.status,
      comment: a.comment,
    }));
    const hasRejected = request.approvals.some(
      (a) => a.status === "REJECTED"
    );
    return NextResponse.json({
      approvals: result,
      requestStatus: request.status,
      canRequest: !request || hasRejected,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch clearance progress" },
      { status: 500 }
    );
  }
}