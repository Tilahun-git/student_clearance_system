import { ApprovalStatus } from "@prisma/client";

export function validateApprovalPayload(
  approvalId: string,
  status: string
) {
  if (!approvalId) {
    throw new Error("Approval ID required");
  }

  if (
    status !== ApprovalStatus.APPROVED &&
    status !== ApprovalStatus.REJECTED
  ) {
    throw new Error("Invalid approval status");
  }
}

export function validateBulkIds(
  ids: string[]
) {
  if (!Array.isArray(ids)) {
    throw new Error("IDs must be array");
  }

  if (ids.length === 0) {
    throw new Error("No IDs provided");
  }
}