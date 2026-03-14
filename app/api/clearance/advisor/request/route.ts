import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// -------------------------
// GET: Fetch pending requests for this advisor
// -------------------------
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const requests = await prisma.clearanceRequest.findMany({
      where: {
        student: { advisorId: session.user.id },
        advisorStatus: "pending", // Only pending requests
      },
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// -------------------------
// PATCH: Approve a request
// -------------------------
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status } = await req.json();

    // Validate status
    if (!["pending", "approved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch the request with student info
    const clearance = await prisma.clearanceRequest.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!clearance) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Ensure this advisor owns this student
    if (clearance.student.advisorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update advisor status
    const updated = await prisma.clearanceRequest.update({
      where: { id },
      data: { advisorStatus: status },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}