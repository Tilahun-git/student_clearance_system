import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ApprovalStatus } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getAuthorizedStaff, hasRoleAccess } from "@/lib/clearance/approval.authorization";
import { getApprovalById } from "@/lib/clearance/approval.query";
import { processApprovalWorkflow } from "@/lib/clearance/approval.workflow";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await getAuthorizedStaff(session.user.id);
    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const activeRole = session.user.activeRole;
    const roleNames  = staff.user.roles.map((r) => r.role.name as string);

    if (!activeRole || !roleNames.includes(activeRole)) {
      return NextResponse.json({ error: "No active role" }, { status: 403 });
    }

    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No approval ids provided" }, { status: 400 });
    }

    let successCount = 0;
    let skippedCount = 0;

    for (const id of ids) {
      const approval = await getApprovalById(id);
      if (!approval) continue;

      if (!hasRoleAccess(roleNames, approval.role.name)) continue;
      if (approval.status !== ApprovalStatus.PENDING) continue;

      // Library borrow check — skip students with unreturned books
      if (activeRole === "LIBRARY") {
        const studentId = approval.clearanceRequest.student.id;
        const blocked = await prisma.libraryBorrow.findFirst({
          where: { studentId, returned: false },
        });
        if (blocked) {
          skippedCount++;
          continue;
        }
      }

      await processApprovalWorkflow(id, staff.id, ApprovalStatus.APPROVED);
      successCount++;
    }

    return NextResponse.json({
      message: `${successCount} approved${skippedCount > 0 ? `, ${skippedCount} skipped (unreturned books)` : ""}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}