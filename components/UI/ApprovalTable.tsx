"use client";

import { ClearanceApprovalRequest } from "@/types/clearance";
import { CheckCircle, XCircle, BookX } from "lucide-react";

type ApprovalTableProps = {
  requests: ClearanceApprovalRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll?: () => void;
  /** Student IDs (e.g. "WDU23001") that have unreturned library books */
  blockedStudentIds?: Set<string>;
};

export default function ApprovalTable({
  requests,
  onApprove,
  onReject,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  blockedStudentIds,
}: ApprovalTableProps) {
  // Only non-blocked requests can be selected
  const selectableIds = requests
    .filter((r) => !(blockedStudentIds?.has(r.clearanceRequest.student.studentId)))
    .map((r) => r.id);

  const allSelectableSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.includes(id));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3.5 w-10">
                {/* Select-all only selects non-blocked rows */}
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 disabled:opacity-40"
                  checked={allSelectableSelected}
                  disabled={selectableIds.length === 0}
                  onChange={onToggleSelectAll ?? (() => {})}
                />
              </th>
              <th className="px-4 py-3.5">Student ID</th>
              <th className="px-4 py-3.5">First Name</th>
              <th className="px-4 py-3.5">Middle Name</th>
              <th className="px-4 py-3.5">Last Name</th>
              <th className="px-4 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => {
              const student    = request.clearanceRequest.student;
              const isSelected = selectedIds.includes(request.id);
              const isBlocked  = blockedStudentIds?.has(student.studentId) ?? false;

              return (
                <tr
                  key={request.id}
                  className={`transition-colors ${
                    isBlocked
                      ? "bg-red-50/40"
                      : isSelected
                      ? "bg-indigo-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {/* Row checkbox — disabled for blocked students */}
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isBlocked}
                      onChange={() => !isBlocked && onToggleSelect(request.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                    {student.studentId}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{student.firstName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{student.middleName || "—"}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{student.lastName}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center gap-2">
                      {/* Approve button — disabled with tooltip if student has unreturned book */}
                      <div className="relative group">
                        <button
                          onClick={() => !isBlocked && onApprove(request.id)}
                          disabled={isBlocked}
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition
                            ${isBlocked
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"}
                          `}
                        >
                          {isBlocked ? <BookX size={13} /> : <CheckCircle size={13} />}
                          Approve
                        </button>

                        {isBlocked && (
                          <div className="
                            absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                            w-56 px-3 py-2 text-xs text-white bg-slate-800 rounded-xl shadow-lg
                            opacity-0 group-hover:opacity-100 pointer-events-none
                            transition-opacity duration-150 text-center
                          ">
                            <BookX size={11} className="inline mr-1 mb-0.5" />
                            Student has an unreturned library book. Mark it as returned first.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                          </div>
                        )}
                      </div>

                      {/* Reject — always active */}
                      <button
                        onClick={() => onReject(request.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        <XCircle size={13} />
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
    </div>
  );
}
