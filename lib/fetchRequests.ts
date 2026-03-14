export interface ClearanceRequest {
  id: string;
  student: { user: { name: string } };
  createdAt: string;
  advisorStatus: string;
}

// Fetch all pending clearance requests for advisor
export async function fetchRequests(): Promise<ClearanceRequest[]> {
  const res = await fetch("/api/clearance/advisor/request");
  if (!res.ok) {
    throw new Error("Failed to fetch clearance requests");
  }
  return res.json();
}

// Approve a request
export async function approveRequest(id: string): Promise<void> {
  const res = await fetch("/api/clearance/advisor/request", {
    method: "PATCH",
    body: JSON.stringify({ id, status: "approved" }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to approve request");
  }
}