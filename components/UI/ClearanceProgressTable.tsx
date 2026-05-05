"use client";

import { useState } from "react";

export default function ClearanceTable({ data }: { data: any[] }) {
  const [reason, setReason] = useState<string | null>(null);

  function statusBadge(status: string) {
    if (status === "APPROVED")
      return "bg-green-100 text-green-700";
    if (status === "REJECTED")
      return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-700";
  }

  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-3 px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100">
          <span>Department</span>
          <span>Status</span>
          <span>Reason</span>
        </div>
        {data.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-3 px-6 py-4 border-t items-center"
          >
            <span className="text-slate-800">{item.role}</span>

            <span>
              <span
                className={`px-4 py-1 rounded-full text-sm ${statusBadge(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </span>

            <span>
              {item.status === "REJECTED" ? (
                <button
                  onClick={() => setReason(item.comment)}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm hover:bg-blue-200"
                >
                  View reason
                </button>
              ) : (
                <span className="text-slate-400">---</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* REASON MODAL */}
      {reason && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg">
            <h3 className="font-semibold text-lg mb-2">
              Rejection Reason
            </h3>

            <p className="text-sm text-slate-600">{reason}</p>

            <button
              onClick={() => setReason(null)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}