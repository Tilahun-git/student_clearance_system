export const ApprovalStatusEnum = {
  PENDING: "PENDING",
  
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatusType =
  (typeof ApprovalStatusEnum)[keyof typeof ApprovalStatusEnum];