export const Reasons = [
  { id: "r1", name: "Graduation" },
  { id: "r2", name: "Withdrawal" },
  { id: "r3", name: "Transfer" },
  { id: "r4", name: "Temporary Leave" },
  { id: "r5", name: "Academic Dismissal" },
] as const;

export type Reason = (typeof Reasons)[number];

export interface StudentClearanceRequest {
  id: string;
  createdAt: string;
  reason: string;
  student: {
    id: string;
    studentId: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export const ApprovalStatusEnum = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatusType =
  (typeof ApprovalStatusEnum)[keyof typeof ApprovalStatusEnum];
export interface ClearanceApprovalRequest {
  id: string;
  clearanceRequest: {
    id: string;
    student: {
      id: string;
      studentId: string;
      user: {
        name: string;
        email: string;
      };
    };
    reason?: string;
    academicYear?: string;
    semester?: string;
    createdAt: string;
  };
  status: ApprovalStatusType;
  comment?: string;
}