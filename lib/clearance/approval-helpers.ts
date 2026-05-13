import { prisma } from "@/lib/prisma";
import { ApprovalStatus } from "@prisma/client";

export async function allRoleApprovalsCompleted(requestId: string,roleName: string) {

  const approvals = await prisma.clearanceApproval.findMany({
      where: {
        clearanceRequestId: requestId,
        role: {
          name: roleName,
        },
      },
    });
  return approvals.every((approval) => approval.status === ApprovalStatus.APPROVED);
}