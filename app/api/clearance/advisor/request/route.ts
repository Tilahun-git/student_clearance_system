import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { RoleType, ApprovalStatus } from "@prisma/client";

// -------------------------
// GET: Fetch pending requests for this advisor
// -------------------------
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Fetch pending clearance approvals for this advisor
    const pendingApprovals = await prisma.clearanceApproval.findMany({
      where: {
        role: { name: RoleType.ADVISOR },
        status: ApprovalStatus.PENDING,
        clearanceRequest: {
          student: {
            advisorId: session.user.id,
          },
        },
      },
      include: {
        clearanceRequest: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
        staff: true,
        role: true,
      },
      orderBy: {
        clearanceRequest: { createdAt: "desc" },
      },
    });

    return NextResponse.json(pendingApprovals);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// -------------------------
// PATCH: Approve or reject a request as advisor
// -------------------------
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { approvalId, status, comment } = await req.json();

    // Validate status
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch the approval
    const approval = await prisma.clearanceApproval.findUnique({
      where: { id: approvalId },
      include: {
        clearanceRequest: { include: { student: true } },
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    // Ensure this staff/advisor owns this approval
    if (approval.clearanceRequest.student.advisorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update approval
    const updated = await prisma.clearanceApproval.update({
      where: { id: approvalId },
      data: {
        status: status as ApprovalStatus,
        comment: comment ?? undefined,
        staffId: session.user.id, // assign the advisor
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}