"use client";

import { ChevronDown, X, Trash2, Loader2 } from "lucide-react";

export type DepartmentRow = {
  id: string;
  name: string;
  school?: { name?: string };
  head?: { user?: { name?: string } };
};

function SkeletonRow() {
  return (
    <tr>{[1,2,3,4,5].map((i) => (
      <td key={i} className="px-5 py-4"><div className="skeleton h-4 rounded w-3/4" /></td>
    ))}</tr>
  );
}

type Props = {
  departments: DepartmentRow[];
  loading: boolean;
  selectedDept: string | null;
  headOptions: any[];
  assigning: boolean;
  deletingId: string | null;
  onOpenAssign: (deptId: string) => void;
  onAssignHead: (deptId: string, headId: string) => void;
  onCancelAssign: () => void;
  onDelete: (id: string) => void;
};

export default function DepartmentTable({
  departments, loading, selectedDept, headOptions, assigning, deletingId,
  onOpenAssign, onAssignHead, onCancelAssign, onDelete,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Department</th>
              <th className="px-5 py-3.5">School</th>
              <th className="px-5 py-3.5">Head</th>
              <th className="px-5 py-3.5">Assign</th>
              <th className="px-5 py-3.5">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">No departments found.</td>
              </tr>
            ) : (
              departments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  {/* Name */}
                  <td className="px-5 py-3.5 font-medium text-slate-800">{d.name}</td>

                  {/* School */}
                  <td className="px-5 py-3.5 text-slate-600">
                    {d.school?.name ?? <span className="text-slate-400">—</span>}
                  </td>

                  {/* Head */}
                  <td className="px-5 py-3.5">
                    {d.head?.user?.name ? (
                      <span className="px-2.5 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                        {d.head.user.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Not assigned
                      </span>
                    )}
                  </td>

                  {/* Assign / Reassign */}
                  <td className="px-5 py-3.5">
                    {selectedDept === d.id ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select onChange={(e) => onAssignHead(d.id, e.target.value)} defaultValue=""
                            className="w-full appearance-none pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                            <option value="" disabled>Select head…</option>
                            {headOptions.map((h) => <option key={h.id} value={h.id}>{h.user.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        <button onClick={onCancelAssign}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => onOpenAssign(d.id)} disabled={assigning}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50">
                        {d.head?.user?.name ? "Reassign" : "Assign"}
                      </button>
                    )}
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-3.5">
                    <button onClick={() => onDelete(d.id)} disabled={deletingId === d.id}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      title="Delete department">
                      {deletingId === d.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
