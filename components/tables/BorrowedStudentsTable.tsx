"use client";

import { CheckCircle2, XCircle, Loader2, Trash2 } from "lucide-react";

export type BorrowRecord = {
  id: string;
  returned: boolean;
  createdAt: string;
  student: {
    id: string;
    studentId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    department?: { name: string };
  };
};

function SkeletonRow() {
  return (
    <tr>{[1,2,3,4,5,6,7].map((i) => (
      <td key={i} className="px-5 py-4"><div className="skeleton h-4 rounded w-3/4" /></td>
    ))}</tr>
  );
}

function Toggle({ checked, onChange, loading }: {
  checked: boolean; onChange: () => void; loading: boolean;
}) {
  return (
    <button onClick={onChange} disabled={loading}
      title={checked ? "Mark as not returned" : "Mark as returned"}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-emerald-500" : "bg-slate-300"}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

type Props = {
  borrows: BorrowRecord[];
  loading: boolean;
  search: string;
  togglingId: string | null;
  deletingId: string | null;
  onToggleReturned: (borrow: BorrowRecord) => void;
  onDelete: (borrow: BorrowRecord) => void;
};

export default function BorrowedStudentsTable({
  borrows, loading, search, togglingId, deletingId, onToggleReturned, onDelete,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Student ID</th>
              <th className="px-5 py-3.5">First Name</th>
              <th className="px-5 py-3.5">Middle Name</th>
              <th className="px-5 py-3.5">Last Name</th>
              <th className="px-5 py-3.5">Department</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-center">Returned</th>
              <th className="px-5 py-3.5">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : borrows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                  {search
                    ? "No students match your search."
                    : "No borrowed students recorded yet. Add one above."}
                </td>
              </tr>
            ) : (
              borrows.map((b) => (
                <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${b.returned ? "opacity-60" : ""}`}>
                  <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-700">
                    {b.student.studentId}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{b.student.firstName}</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {b.student.middleName || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{b.student.lastName}</td>
                  <td className="px-5 py-3.5">
                    {b.student.department?.name ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {b.student.department.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {b.returned ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 size={11} />
                        Returned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600 border border-red-100">
                        <XCircle size={11} />
                        Not returned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Toggle
                      checked={b.returned}
                      onChange={() => onToggleReturned(b)}
                      loading={togglingId === b.id}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => onDelete(b)}
                      disabled={deletingId === b.id || !b.returned}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title={b.returned ? "Remove borrow record" : "Book must be returned before deleting"}
                    >
                      {deletingId === b.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Trash2 size={13} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
