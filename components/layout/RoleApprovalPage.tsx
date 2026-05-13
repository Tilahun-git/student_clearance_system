"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ApprovalTable from "@/components/UI/ApprovalTable";
import {
  fetchApprovals,
  updateApproval,
  bulkApproveApprovals,
} from "@/lib/api/clearance";

import { ApprovalStatus } from "@prisma/client";

import { ClearanceApprovalRequest } from "@/types/clearance";

type Props = {
  role: string;
};

export default function RoleApprovalPage({
  role,
}: Props) {
  const [requests, setRequests] = useState<ClearanceApprovalRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [role]);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await fetchApprovals();

      setRequests(Array.isArray(data) ? data : []);

      console.log("fetched requests are : ", requests)
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
      await updateApproval(
        id,
        ApprovalStatus.APPROVED
      );

      toast.success("Approved successfully");

      setRequests((prev) =>
        prev.filter((r) => r.id !== id)
      );

      setSelectedIds((prev) =>
        prev.filter((x) => x !== id)
      );
    } catch {
      toast.error("Error approving request");
    }
  }

  async function approveSelected() {
    if (!selectedIds.length) {
      return toast.error("No requests selected");
    }

    try {
      await bulkApproveApprovals(selectedIds);

      toast.success(
        "Selected requests approved"
      );

      setRequests((prev) =>
        prev.filter(
          (r) => !selectedIds.includes(r.id)
        )
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

  function closeRejectModal() {
    setRejectingId(null);
    setComment("");
    setSubmittingReject(false);
  }

  async function submitReject() {
    if (!comment.trim()) {
      return toast.error(
        "Enter rejection reason"
      );
    }

    try {
      setSubmittingReject(true);

      await updateApproval(
        rejectingId!,
        ApprovalStatus.REJECTED,
        comment
      );

      toast.success("Rejected successfully");

      setRequests((prev) =>
        prev.filter(
          (r) => r.id !== rejectingId
        )
      );

      setSelectedIds((prev) =>
        prev.filter(
          (id) => id !== rejectingId
        )
      );
      closeRejectModal();
    } catch {
      toast.error("Error rejecting request");
    } finally {
      setSubmittingReject(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full px-4 sm:px-6 py-4 space-y-4">
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <p className="text-slate-500 text-sm sm:text-base">
                Loading approvals...
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 flex items-center justify-center">
              <p className="text-slate-500 text-sm sm:text-base text-center">
                No pending approvals received
              </p>
            </div>

          ) : (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center flex-wrap gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    Selected
                  </span>
                  <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {selectedIds.length}
                  </span>

                  <span className="text-xs text-slate-500">
                    of {requests.length}
                  </span>

                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                  <button
                    onClick={toggleSelectAll}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition"
                  >
                    {selectedIds.length ===
                    requests.length
                      ? "Unselect All"
                      : "Select All"}
                  </button>

                  <button
                    onClick={approveSelected}
                    disabled={!selectedIds.length}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                      !selectedIds.length
                        ? "bg-green-200 text-green-700 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                    }`}
                  >
                    Approve Selected
                  </button>

                </div>

              </div>

              {/* TABLE */}

              <ApprovalTable
                requests={requests}
                onApprove={approve}
                onReject={openReject}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />

            </div>
          )}

        </section>

      </div>

      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-200 px-5 sm:px-6 py-4 bg-red-50">
              <h2 className="text-lg sm:text-xl font-semibold text-red-600">
                Reject Clearance Request
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Please provide a reason for rejection.
              </p>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Rejection Reason
                </label>
                <textarea
                  rows={6}
                  placeholder="Enter detailed rejection reason..."
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  className="w-full resize-none rounded-2xl border border-slate-300 p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
                />
              </div>

            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={closeRejectModal}
                disabled={submittingReject}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={submitReject}
                disabled={submittingReject}
                className={`px-5 py-2.5 rounded-xl text-white transition ${
                  submittingReject
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submittingReject
                  ? "Submitting..."
                  : "Submit Rejection"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}