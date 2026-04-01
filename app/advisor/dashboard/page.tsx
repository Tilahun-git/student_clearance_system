"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import {
  fetchRequests,
  updateRequest,
} from "@/lib/fetchRequests";
import {ApprovalStatusEnum,ClearanceApprovalRequest} from '@/lib/clearanceData'
import Header from "@/components/layout/Header";

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
      const data  = await fetchRequests();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response from server");
    }

      console.log("Requests for the advisor : ", data);

      setRequests(data );
    } catch (error: any) {
      console.error("Frontend error:", error.message);

      toast.error(error.message || "Failed to load requests");

      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    try {
      await updateRequest(id, ApprovalStatusEnum.APPROVED);
      toast.success("Request approved");
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || "Error approving request");
    }
  }

  function openReject(id: string) {
    setRejectingId(id);
    setComment("");
  }

  async function submitReject() {
    if (!comment.trim()) {
      return toast.error("Please enter a rejection reason");
    }

    try {
      await updateRequest(
        rejectingId!,
        ApprovalStatusEnum.REJECTED,
        comment
      );
      toast.success("Request rejected");
      setRejectingId(null);
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || "Error rejecting request");
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-200">
      <DashBoardNavbar />

      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6  border-gray-100">
          <Header />

          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-lg">
                <h1>No requests received yet</h1>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-100">
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-800">
                            {
                              request.clearanceRequest?.student?.user?.name || "No Name"
                            }
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.clearanceRequest?.student?.studentId || "N/A"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => approve(request.id)}
                              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-300 text-black shadow hover:bg-green-700 active:scale-95 transition"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => openReject(request.id)}
                              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white shadow hover:bg-red-600 active:scale-95 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center text-black bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Reject Request
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a clear reason for rejection.
            </p>

            <textarea
              placeholder="Type your reason here..."
              className="w-full h-28 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400 focus:outline-none resize-none text-sm"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={submitReject}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 shadow active:scale-95 transition"
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