import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { RoleType, ClearanceStatus } from "@prisma/client";

// GET: fetch pending approvals for current staff member
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const staffRoles = session.user.roles;
    const staffId = session.user.id;

    const approvals = await prisma.clearanceApproval.findMany({
      where: {
        staffId: staffId,
        status: "PENDING",
      },
      include: {
        clearanceRequest: {
          include: {
            student: {
              include: { user: true },
            },
            approvals: true,
          },
        },
        role: true,
      },
    });

    return NextResponse.json(approvals);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

// PATCH: update approval status
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roles) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { approvalId, status, comment } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const approval = await prisma.clearanceApproval.update({
      where: { id: approvalId },
      data: {
        status,
        comment,
        approvedAt: new Date(),
      },
      include: {
        clearanceRequest: true,
      },
    });

    return NextResponse.json(approval);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update approval" }, { status: 500 });
  }
}