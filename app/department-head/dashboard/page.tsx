"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Header from "@/components/layout/Header";
import ApprovalTable from "@/components/UI/ApprovalTable";
import {fetchApprovals,updateApproval} from "@/lib/api/clearance";
import { ApprovalStatusEnum } from "@/lib/constants/enums";
import { ClearanceApprovalRequest } from "@/types/clearance";


export default function DepartmentHead() {
  const [requests, setRequests] = useState<ClearanceApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const data = await fetchApprovals();
      setRequests(data);
    } catch {
      toast.error("Failed to load current requests");
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    try {
      await updateApproval(id, ApprovalStatusEnum.APPROVED);

      toast.success("Approved");

      setRequests((prev) =>
        prev.filter((req) => req.id !== id)
      );
    } catch {
      toast.error("Error approving");
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
        prev.filter((req) => req.id !== rejectingId)
      );

      setRejectingId(null);
    } catch {
      toast.error("Error rejecting");
    }
  }
  return (
  <div className="min-h-screen bg-slate-100">
    <DashBoardNavbar />

    <Header />

    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">

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
          />
        )}

      </section>

    </main>

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