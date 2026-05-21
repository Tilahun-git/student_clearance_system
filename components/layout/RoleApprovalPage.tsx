"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import ApprovalTable from "@/components/tables/ApprovalTable";
import { fetchApprovals, updateApproval, bulkApproveApprovals } from "@/lib/api/clearance";
import { fetchBlockedStudentIds } from "@/lib/api/library";
import { ApprovalStatus, RoleType } from "@prisma/client";
import { ClearanceApprovalRequest } from "@/types/clearance";
import { ClipboardCheck, CheckCheck, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { useClearanceSync } from "@/contexts/ClearanceRealtimeContext";

const PAGE_SIZE = 10;
type Props = { role: string };

export default function RoleApprovalPage({ role }: Props) {
  const { status } = useSession();
  const [requests, setRequests] = useState<ClearanceApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submittingReject, setSubmittingReject] = useState(false);
  const [blockedStudentIds, setBlockedStudentIds] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadRequests = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const data = await fetchApprovals();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      if (!silent) toast.error(`Failed to load ${role} requests`);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadRequests(false);
  }, [status, loadRequests]);

  useClearanceSync(() => loadRequests(true), {
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (role !== RoleType.LIBRARY || status !== "authenticated") return;
    fetchBlockedStudentIds()
      .then((ids) => setBlockedStudentIds(new Set(ids)))
      .catch(() => setBlockedStudentIds(new Set()));
  }, [role, status]);

  useEffect(() => {
    if (rejectingId) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [rejectingId]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") closeRejectModal();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    const selectableIds = requests
      .filter((r) => !blockedStudentIds.has(r.clearanceRequest.student.studentId))
      .map((r) => r.id);
    const allSelected = selectableIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : selectableIds);
  }

  async function approve(id: string) {
    const previous = requests;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));

    try {
      await updateApproval(id, ApprovalStatus.APPROVED);
      toast.success("Approved successfully");
    } catch (err: unknown) {
      setRequests(previous);
      const message = err instanceof Error ? err.message : "Error approving request";
      toast.error(message);
    }
  }

  async function approveSelected() {
    if (!selectedIds.length) return toast.error("No requests selected");

    const previous = requests;
    const idsToApprove = [...selectedIds];
    setRequests((prev) => prev.filter((r) => !idsToApprove.includes(r.id)));
    setSelectedIds([]);

    try {
      await bulkApproveApprovals(idsToApprove);
      toast.success("Selected requests approved");
    } catch {
      setRequests(previous);
      toast.error("Bulk approval failed");
    }
  }

  function openRejectModal(id: string) {
    setRejectingId(id);
    setComment("");
  }

  function closeRejectModal() {
    setRejectingId(null);
    setComment("");
  }

  async function submitReject() {
    if (!comment.trim()) return toast.error("Please enter a rejection reason");

    const rejectId = rejectingId!;
    const previous = requests;
    setRequests((prev) => prev.filter((r) => r.id !== rejectId));
    closeRejectModal();

    try {
      setSubmittingReject(true);
      await updateApproval(rejectId, ApprovalStatus.REJECTED, comment);
      toast.success("Request rejected");
    } catch {
      setRequests(previous);
      toast.error("Error rejecting request");
    } finally {
      setSubmittingReject(false);
    }
  }

  const { page, totalPages, totalItems, paged, goTo } = usePagination(requests, PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">Clearance Requests</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{role.replace(/_/g, " ")} · {requests.length} pending</span>
              {refreshing && (
                <span className="inline-flex items-center gap-1 text-indigo-500">
                  <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Updating…
                </span>
              )}
            </p>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={approveSelected}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition"
          >
            <CheckCheck size={15} />
            Approve {selectedIds.length} selected
          </button>
        )}
      </div>

      {requests.length > 1 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="select-all"
            checked={
              requests
                .filter((r) => !blockedStudentIds.has(r.clearanceRequest.student.studentId))
                .every((r) => selectedIds.includes(r.id)) &&
              requests.some((r) => !blockedStudentIds.has(r.clearanceRequest.student.studentId))
            }
            onChange={toggleSelectAll}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
          />
          <label htmlFor="select-all" className="text-sm text-slate-600 cursor-pointer">
            Select all ({requests.filter((r) => !blockedStudentIds.has(r.clearanceRequest.student.studentId)).length} eligible)
          </label>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading requests…</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-slate-600 font-medium">All caught up!</p>
          <p className="text-sm text-slate-400 mt-1">No pending requests at this time.</p>
        </div>
      ) : (
        <>
          <ApprovalTable
            requests={paged}
            onApprove={approve}
            onReject={openRejectModal}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            blockedStudentIds={blockedStudentIds}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={goTo}
          />
        </>
      )}

      {rejectingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && closeRejectModal()}
        >
          <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden modal-panel">
            <div className="h-1.5 w-full bg-red-500" />
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Reject Request</h2>
                </div>
              </div>
              <button
                onClick={closeRejectModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Rejection Reason
                </label>
                <textarea
                  ref={textareaRef}
                  placeholder="Describe clearly why this request is being rejected."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl resize-none bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 focus:bg-white placeholder:text-slate-400 transition-all duration-150"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={closeRejectModal}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReject}
                  disabled={submittingReject || !comment.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submittingReject ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
