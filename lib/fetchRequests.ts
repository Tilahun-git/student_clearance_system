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

export async function fetchRequests(): Promise<ClearanceApprovalRequest[]> {
  const res = await fetch("/api/clearance/advisor/request");

  if (!res.ok) {
    throw new Error("Failed to fetch clearance requests");
  }

  return res.json();
}

export async function updateRequest(
  approvalId: string,
  status: ApprovalStatusType,
  comment?: string
): Promise<any> {
  const res = await fetch("/api/clearance/advisor/request", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ approvalId, status, comment }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update request`);
  }

  return res.json();
}