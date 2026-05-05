"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ApprovalTable from "@/components/UI/ApprovalTable";
import {
  fetchApprovals,
  updateApproval,
  bulkApproveApprovals,
} from "@/lib/api/clearance";
import { ApprovalStatusEnum } from "@/lib/constants/enums";
import { ClearanceApprovalRequest } from "@/types/clearance";

type Props = {
  role: string;
};

export default function RoleApprovalPage({ role }: Props) {
  const [requests, setRequests] = useState<ClearanceApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadRequests();
  }, [role]);

  async function loadRequests() {
    try {
      const data = await fetchApprovals();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      toast.error(`Failed to load ${role} requests`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.length === requests.length
        ? []
        : requests.map((r) => r.id)
    );
  }

  async function approve(id: string) {
    try {
      await updateApproval(id, ApprovalStatusEnum.APPROVED);
      toast.success("Approved");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Error approving");
    }
  }

  async function approveSelected() {
    if (!selectedIds.length) {
      return toast.error("No requests selected");
    }

    try {
      await bulkApproveApprovals(selectedIds);
      toast.success("Selected requests approved");

      setRequests((prev) =>
        prev.filter((r) => !selectedIds.includes(r.id))
      );

      setSelectedIds([]);
    } catch {
      toast.error("Bulk approval failed");
    }
  }

  function openReject(id: string) {
    setRejectingId(id);
    setComment("");
  }

  async function submitReject() {
    if (!comment.trim()) {
      return toast.error("Enter rejection reason");
    }

    try {
      await updateApproval(
        rejectingId!,
        ApprovalStatusEnum.REJECTED,
        comment
      );

      toast.success("Rejected");

      setRequests((prev) =>
        prev.filter((r) => r.id !== rejectingId)
      );

      setRejectingId(null);
    } catch {
      toast.error("Error rejecting");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER BAR */}
      <div className="w-full px-6 py-4 space-y-2">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              Selected
            </span>

            <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {selectedIds.length}
            </span>

            <span className="text-xs text-slate-400">
              of {requests.length}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              {selectedIds.length === requests.length
                ? "Unselect All"
                : "Select All"}
            </button>

            <button
              onClick={approveSelected}
              disabled={!selectedIds.length}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
                !selectedIds.length
                  ? "bg-green-200 text-green-700 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Approve Selected
            </button>

          </div>
        </div>

        {/* TABLE */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>

          ) : requests.length === 0 ? (
            <p className="text-center text-gray-500">
              No pending approvals
            </p>

          ) : (
            <ApprovalTable
              requests={requests}
              onApprove={approve}
              onReject={openReject}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          )}

        </section>

      </div>

      {/* MODAL */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">

            <h2 className="mb-3 font-semibold text-gray-800">
              Reject Reason
            </h2>

            <textarea
              className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-red-400"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={submitReject}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}