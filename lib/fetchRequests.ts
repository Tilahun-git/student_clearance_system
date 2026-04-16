import { ClearanceApprovalRequest,ApprovalStatusType } from "./clearanceData";



export async function fetchRequests(): Promise<ClearanceApprovalRequest[]> {
  const res = await fetch("/api/clearance/approve");

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch clearance requests");
  }

  return data;
}

export async function updateRequest(
  approvalId: string,
  status: ApprovalStatusType,
  comment?: string
): Promise<any> {
  const res = await fetch("/api/clearance/approve", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ approvalId, status, comment }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update request");
  }

  return data;
}