"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { ClearanceApprovalRow } from "@/lib/api/student";
import { ApprovalStatus } from "@prisma/client";

function StatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === ApprovalStatus.APPROVED)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 size={11} />
        Approved
      </span>
    );

  if (status === ApprovalStatus.REJECTED)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
        <XCircle size={11} />
        Rejected
      </span>
    );

  if (status === ApprovalStatus.WAITING)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200">
        <Clock size={11} />
        Waiting
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
      <Clock size={11} />
      Pending
    </span>
  );
}

type Props = {
  data: ClearanceApprovalRow[];
};

export default function ClearanceTable({ data }: Props) {
  const [reason, setReason] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Office or role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-800">
                  {item.role.replace(/_/g, " ")}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-5 py-3.5">
                  {item.status === "REJECTED" ? (
                    <button
                      onClick={() => setReason(item.comment)}
                      className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition border border-red-100"
                    >
                      View reason
                    </button>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reason && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setReason(null)}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden modal-panel mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Rejection Reason</h3>
              <button
                onClick={() => setReason(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 leading-relaxed">{reason}</p>
              <button
                onClick={() => setReason(null)}
                className="mt-4 w-full py-2 text-sm font-medium rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
