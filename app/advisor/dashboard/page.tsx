"use client";

import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import { useEffect, useState } from "react";
import { fetchRequests, updateRequest, ClearanceApprovalRequest, ApprovalStatusEnum } from "@/lib/fetchRequests";

export default function AdvisorDashboard() {
  const [requests, setRequests] = useState<ClearanceApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch requests on mount
  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await fetchRequests();
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  // Approve request and refresh
  async function approve(approvalId: string) {
    try {
      await updateRequest(approvalId, ApprovalStatusEnum.APPROVED);
      const updated = await fetchRequests();
      setRequests(updated);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashBoardNavbar />

      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Pending Clearance Requests</h1>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No pending clearance requests 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-3 rounded-tl-lg">Student</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{r.clearanceRequest.student.user.name}</td>
                    <td className="p-3">{new Date(r.clearanceRequest.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          r.status === ApprovalStatusEnum.PENDING
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.status === ApprovalStatusEnum.PENDING && (
                        <button
                          onClick={() => approve(r.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}