import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes("STUDENT")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const certificates = await prisma.clearanceCertificate.findMany({
    where: { studentId: session.user.studentId },
  });

  return NextResponse.json(certificates);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles?.includes("STUDENT")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { requestId, fileName, fileUrl } = await req.json();

    if (!requestId || !fileName || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

  if (!session.user.studentId) {
  return NextResponse.json({ error: "Student ID missing" }, { status: 400 });
}

const certificate = await prisma.clearanceCertificate.create({
  data: {
    studentId: session.user.studentId,
    requestId,
    fileName,
    fileUrl,
  },
});

    return NextResponse.json(certificate, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
  }
}