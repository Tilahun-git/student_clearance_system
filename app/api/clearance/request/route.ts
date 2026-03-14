import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ClearanceRequestBody = {
  school?: string;
  department?: string;
  program?: string;
  reason?: string;
  academicYear?: string;
  semester?: string;
};
// -------------------------
// GET: Fetch student's clearance requests
// -------------------------
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { clearances: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Not a student" }, { status: 403 });
  }

  return NextResponse.json(student.clearances);
}

// -------------------------
// POST: Submit a new clearance request
// -------------------------
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const body: ClearanceRequestBody = await req.json();

    // Prevent duplicate active requests
    const existing = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        registrarStatus: { not: "approved" },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You already have an active request" }, { status: 400 });
    }

    // Create clearance request
    const clearance = await prisma.clearanceRequest.create({
      data: {
        studentId: student.id,
        advisorStatus: "pending",
        deptStatus: "waiting",
        libraryStatus: "waiting",
        financeStatus: "waiting",
        registrarStatus: "waiting",

        school: body.school ?? null,
        department: body.department ?? null,
        program: body.program ?? null,
        reason: body.reason ?? null,
        academicYear: body.academicYear ?? null,
        semester: body.semester ?? null,
      },
    });

    return NextResponse.json(clearance);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}