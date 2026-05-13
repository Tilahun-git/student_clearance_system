import { prisma } from "@/lib/prisma";

import { ApprovalStatus } from "@prisma/client";

export async function areDependenciesApproved(
  requestId: string,
  dependencies: string[]
) {
  const approvals =
    await prisma.clearanceApproval.findMany({
      where: {
        clearanceRequestId: requestId,

        role: {
          name: {
            in: dependencies,
          },
        },
      },

      include: {
        role: true,
      },
    });

  return dependencies.every((roleName) =>
    approvals.some(
      (approval) =>
        approval.role.name === roleName &&
        approval.status ===
          ApprovalStatus.APPROVED
    )
  );
}