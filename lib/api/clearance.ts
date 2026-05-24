import { ApprovalStatus } from "@prisma/client";
import { ClearanceApprovalRequest } from "@/types/clearance";

export async function fetchApprovals(role?: string): Promise<ClearanceApprovalRequest[]> {
  const url = role ? `/api/clearance/approve?role=${encodeURIComponent(role)}` : "/api/clearance/approve";
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch approvals");
  return data;
}

export async function updateApproval(
  approvalId: string,
  status: ApprovalStatus,
  comment?: string,
): Promise<{ message?: string; error?: string }> {
  const res = await fetch("/api/clearance/approve", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvalId, status, comment }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Failed to update approval");
  return data;
}

export async function bulkApproveApprovals(
  ids: string[],
): Promise<{ message?: string; error?: string }> {
  const res = await fetch("/api/clearance/approve/bulk", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Bulk approval failed");
  return data;
}
