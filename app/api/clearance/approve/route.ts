import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getAuthorizedStaff, hasRoleAccess } from "@/lib/clearance/approval.authorization";
import { getApprovalById } from "@/lib/clearance/approval.query";
import { processApprovalWorkflow } from "@/lib/clearance/approval.workflow";
import { fetchApprovalsForStaff } from "@/lib/clearance/approval.fetch";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pass activeRole so the user only sees approvals for the role
    // they are currently logged in as — not all their roles combined.
    const approvals = await fetchApprovalsForStaff(
      session.user.id,
      session.user.activeRole,
    );
    return NextResponse.json(approvals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staff = await getAuthorizedStaff(session.user.id);
    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    // Use activeRole for authorization — the user can only approve
    // requests for the role they are currently acting as.
    const activeRole = session.user.activeRole;
    const roleNames = staff.user.roles.map((r) => r.role.name as string);

    // Verify the active role is valid for this user
    if (!activeRole || !roleNames.includes(activeRole)) {
      return NextResponse.json({ error: "No active role" }, { status: 403 });
    }

    const { approvalId, status, comment } = await req.json();
    const approval = await getApprovalById(approvalId);

    if (!approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    // Only allow approval if the active role matches the approval's required role
    if (!hasRoleAccess([activeRole], approval.role.name)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Library borrow check ──────────────────────────────────────────────
    // If the library manager is trying to APPROVE, block if the student
    // has an unreturned borrow record.
    if (activeRole === "LIBRARY" && status === "APPROVED") {
      const studentId = approval.clearanceRequest.student.id;
      const unreturnedBorrow = await prisma.libraryBorrow.findFirst({
        where: { studentId, returned: false },
      });
      if (unreturnedBorrow) {
        return NextResponse.json(
          {
            error: `Cannot approve: student ${approval.clearanceRequest.student.studentId} has an unreturned library book. Mark it as returned first.`,
          },
          { status: 409 },
        );
      }
    }

    const result = await processApprovalWorkflow(approvalId,staff.id,status,comment);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}