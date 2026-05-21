"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle, Clock } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle2 size={11} />
        Approved
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
        <XCircle size={11} />
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
      <Clock size={11} />
      Pending
    </span>
  );
}

type Props = {
  data: any[];
  approvedCount?: number;
  totalCount?: number;
};

export default function ClearanceTable({ data, approvedCount = 0, totalCount = 0 }: Props) {
  const [reason, setReason] = useState<string | null>(null);

  const pct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  // Progress bar color based on percentage
  const barColor =
    pct === 100
      ? "bg-emerald-500"
      : pct >= 60
      ? "bg-indigo-500"
      : pct >= 30
      ? "bg-amber-500"
      : "bg-slate-300";

  return (
    <>
      {/* ── Progress bar ── */}
      {totalCount > 0 && (
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-600">Overall Progress</span>
            <span
              className={`text-xs font-bold ${
                pct === 100 ? "text-emerald-600" : "text-indigo-600"
              }`}
            >
              {pct}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {approvedCount} of {totalCount} stages approved
          </p>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Stage</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-700">
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

      {/* ── Rejection reason modal ── */}
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
