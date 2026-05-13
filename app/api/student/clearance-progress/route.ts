import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ClearanceStatus } from "@prisma/client";

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
      where: { userId: session.user.id },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    const latestRequest = await prisma.clearanceRequest.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: {
        approvals: {
          include: { role: true },
        },
      },
    });
    const activeRequest = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        status: {
          in: [
            ClearanceStatus.PENDING,
            ClearanceStatus.IN_PROGRESS,
          ],
        },
      },
    });

    const canRequest = !activeRequest;

    if (!latestRequest) {
      return NextResponse.json({
        approvals: [],
        requestStatus: null,
        canRequest: true, 
      });
    }

    const result = latestRequest.approvals.map((a) => ({
      role: a.role.name,
      status: a.status,
      comment: a.comment,
    }));

    return NextResponse.json({
      approvals: result,
      requestStatus: latestRequest.status,
      canRequest,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch clearance progress" },
      { status: 500 }
    );
  }
}