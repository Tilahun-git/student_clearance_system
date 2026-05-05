"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Header from "@/components/layout/Header";
import ApprovalTable from "@/components/UI/ApprovalTable";
import {fetchApprovals,updateApproval} from "@/lib/api/clearance";
import { ApprovalStatusEnum } from "@/lib/constants/enums";
import { ClearanceApprovalRequest } from "@/types/clearance";

export default function AdvisorDashboard() {
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

      if (!Array.isArray(data)) {
        throw new Error("Invalid response from server");
      }

      setRequests(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }
  async function approve(id: string) {
    try {
      await updateApproval(id, ApprovalStatusEnum.APPROVED);
      toast.success("Request approved");
      setRequests((prev) =>
        prev.filter((req) => req.id !== id)
      );
    } catch (error: any) {
      toast.error(error.message || "Error approving request");
    }}

  function openReject(id: string) {
    setRejectingId(id);
    setComment("");
  }
  async function submitReject() {
    if (!comment.trim()) {
      return toast.error("Please enter a reason");
    }
    try {
      await updateApproval(
        rejectingId!,
        ApprovalStatusEnum.REJECTED,
        comment
      );
      toast.success("Request rejected");
      setRequests((prev) =>
        prev.filter((req) => req.id !== rejectingId)
      );
      setRejectingId(null);
    } catch (error: any) {
      toast.error(error.message );
    }}
  return (
  <div className="min-h-screen bg-slate-100">
    <DashBoardNavbar />
    <Header />
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-10 w-10 border-b-2 border-gray-900 rounded-full" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No requests received yet
          </p>
        ) : (
          <ApprovalTable
            requests={requests}
            onApprove={approve}
            onReject={openReject}
          /> )}
      </section>
    </main>
    {rejectingId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Reject Request
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Please provide a clear reason for rejection.
          </p>
          <textarea
            className="w-full h-28 p-3 border rounded-lg text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}/>
          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setRejectingId(null)}
              className="px-4 py-2 bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={submitReject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg">
              Submit
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}