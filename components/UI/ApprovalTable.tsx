"use client";

import { ClearanceApprovalRequest } from "@/types/clearance";
type ApprovalTableProps = {
  requests: ClearanceApprovalRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export default function ApprovalTable({
  requests,
  onApprove,
  onReject,
}: ApprovalTableProps) {
  return (
    <div className="overflow-hidden border rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-50 text-left text-sm text-gray-600">
          <tr>
            <th className="p-3">Student ID</th>
            <th className="p-3">First Name</th>
            <th className="p-3">Middle Name</th>
            <th className="p-3">Last Name</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => {
            const student = request.clearanceRequest.student;

            return (
              <tr
                key={request.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3 text-gray-500">
                  {student.studentId}
                </td>

                <td className="p-3 font-medium text-gray-800">
                  {student.firstName}
                </td>

                <td className="p-3 font-medium text-gray-800">
                  {student.middleName}
                </td>

                <td className="p-3 font-medium text-gray-800">
                  {student.lastName}
                </td>

                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onApprove(request.id)}
                      className="bg-gray-300 text-black px-3 py-1 rounded-2xl hover:bg-green-700 transition"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => onReject(request.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-2xl hover:bg-red-600 transition"
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
  );
}