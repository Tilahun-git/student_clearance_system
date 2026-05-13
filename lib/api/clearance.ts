import { ApprovalStatusType } from "@/lib/constants/enums";
import { ClearanceApprovalRequest } from "@/types/clearance";

type ApiResponse = {
  message?: string;
  error?: string;
};

export async function fetchApprovals(): Promise<ClearanceApprovalRequest[]> {
  
  const res = await fetch("/api/clearance/approve");
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error ||
        "Failed to fetch approvals"
    );
  }

  return data;
}
export async function updateApproval(
  approvalId: string,
  status: ApprovalStatusType,
  comment?: string
): Promise<ApiResponse> {
  const res = await fetch(
    "/api/clearance/approve",
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        approvalId,
        status,
        comment,
      }),
    }
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      data?.error ||
        "Failed to update approval"
    );
  }

  return data;
}

export async function bulkApproveApprovals(
  ids: string[]
): Promise<ApiResponse> {
  const res = await fetch(
    "/api/clearance/approve/bulk",
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        ids,
      }),
    }
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      data?.error ||
        "Bulk approval failed"
    );
  }

  return data;
}