import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Reasons } from "@/lib/constants/reasons";

export async function GET() {
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
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found" },
      { status: 404 }
    );
  }
  const certificates = await prisma.clearanceCertificate.findMany({
    where: {
      studentId: student.id,
    },
    select: {
      id: true,
      fileUrl: true,
      fileName: true,
      issuedAt: true,
      request: {
        select: {
          academicYear: true,
          semester: true,
          reason: true, 
          status: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
              studentId: true,
              program: true,
              year: true,
              section: true,
              school:      { select: { name: true } },
              department:  { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  const formatted = certificates.map((cert) => ({
    ...cert,
    request: cert.request
      ? {
          ...cert.request,
          reason: {
            name:
              Reasons.find((r) => r.id === cert.request.reason)
                ?.name || cert.request.reason || "Unknown",
          },
        }
      : null,
  }));

  return NextResponse.json(formatted);
}