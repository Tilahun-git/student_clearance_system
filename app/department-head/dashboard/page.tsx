"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Header from "@/components/layout/Header";
import {
  fetchApprovals,
  updateApproval,
  ClearanceApprovalRequest,
  ApprovalStatusEnum,
} from "@/lib/deptHeadRequests";

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

      console.log("API RESPONSE:", data);
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
      loadRequests();
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
      setRejectingId(null);
      loadRequests();
    } catch {
      toast.error("Error rejecting");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashBoardNavbar />

      <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow">
        <Header />

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500">
            No pending approvals 🎉
          </p>
        ) : (
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-sm text-gray-600">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => {
                  const student = request?.clearanceRequest?.student;
                  const user = student?.user;

                  return (
                    <tr
                      key={request.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      {/* ✅ SAFE ACCESS */}
                      <td className="p-3 font-medium text-gray-800">
                        {user?.name || "Unknown Student"}
                      </td>

                      <td className="p-3 text-gray-500">
                        {student?.studentId || "N/A"}
                      </td>

                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approve(request.id)}
                            className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-green-700 transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => openReject(request.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="mb-3 font-semibold text-gray-800">
              Reject Reason
            </h2>

            <textarea
              className="w-full border rounded p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={submitReject}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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