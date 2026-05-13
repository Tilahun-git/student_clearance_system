import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {getAuthorizedStaff,hasRoleAccess,} from "@/lib/clearance/approval.authorization";
import {getApprovalById,} from "@/lib/clearance/approval.query";
import {processApprovalWorkflow,} from "@/lib/clearance/approval.workflow";
import {fetchApprovalsForStaff} from "@/lib/clearance/approval.fetch";

export async function GET() {
  try {
    const session =
      await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const approvals = await fetchApprovalsForStaff(session.user.id);
    return NextResponse.json(approvals);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:"Failed to fetch approvals",
      },
      {
        status: 500,
      }
    );
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

    const roleNames = staff.user.roles.map((r) => r.role.name);
    const { approvalId, status, comment } = await req.json();
    const approval = await getApprovalById(approvalId);

    if (!approval) {
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );
    }

    if (!hasRoleAccess(roleNames, approval.role.name)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
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