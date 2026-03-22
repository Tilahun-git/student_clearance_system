
export const ApprovalStatusEnum = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatusType =
  (typeof ApprovalStatusEnum)[keyof typeof ApprovalStatusEnum];

export type ClearanceApprovalRequest = {
  id: string;
  status: string;

  clearanceRequest: {
    id: string;
    student: {
      studentId: string;
      user: {
        name: string;
      };
    };
  };
};


export async function fetchApprovals() {
  const res = await fetch("/api/clearance/approve");

  if (!res.ok) throw new Error("Failed to fetch");

  return res.json();
}


export async function updateApproval(
  approvalId: string,
  status: ApprovalStatusType,
  comment?: string
) {
  const res = await fetch("/api/clearance/approve", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvalId, status, comment }),
  });

  if (!res.ok) throw new Error("Failed to update");
}