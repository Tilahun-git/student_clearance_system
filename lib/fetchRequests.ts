export const ApprovalStatusEnum = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatusType = typeof ApprovalStatusEnum[keyof typeof ApprovalStatusEnum];

export interface ClearanceApprovalRequest {
  id: string; // Approval record ID
  clearanceRequest: {
    id: string;
    student: {
      id: string;
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
): Promise<void> {
  const res = await fetch("/api/clearance/advisor/request", {
    method: "PATCH",
    body: JSON.stringify({ approvalId, status, comment }), 
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to update request: ${res.statusText}`);
  }
}