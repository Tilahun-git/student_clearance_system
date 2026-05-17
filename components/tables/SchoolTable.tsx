"use client";

import { ChevronDown, X, Trash2, Loader2 } from "lucide-react";

export type SchoolRow = {
  id: string;
  name: string;
  school_dean?: { user?: { name?: string } };
};

function SkeletonRow() {
  return (
    <tr>{[1,2,3,4].map((i) => (
      <td key={i} className="px-5 py-4"><div className="skeleton h-4 rounded w-3/4" /></td>
    ))}</tr>
  );
}

type Props = {
  schools: SchoolRow[];
  loading: boolean;
  selectedSchool: string | null;
  deanOptions: any[];
  assigning: boolean;
  deletingId: string | null;
  onOpenAssign: (schoolId: string) => void;
  onAssignDean: (schoolId: string, deanId: string) => void;
  onCancelAssign: () => void;
  onDelete: (id: string) => void;
};

export default function SchoolTable({
  schools, loading, selectedSchool, deanOptions, assigning, deletingId,
  onOpenAssign, onAssignDean, onCancelAssign, onDelete,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">School Name</th>
              <th className="px-5 py-3.5">Dean</th>
              <th className="px-5 py-3.5">Assign</th>
              <th className="px-5 py-3.5">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">No schools found.</td>
              </tr>
            ) : (
              schools.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  {/* Name */}
                  <td className="px-5 py-3.5 font-medium text-slate-800">{s.name}</td>

                  {/* Dean */}
                  <td className="px-5 py-3.5">
                    {s.school_dean?.user?.name ? (
                      <span className="px-2.5 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {s.school_dean.user.name}
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
                    {selectedSchool === s.id ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select onChange={(e) => onAssignDean(s.id, e.target.value)} defaultValue=""
                            className="w-full appearance-none pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                            <option value="" disabled>Select dean…</option>
                            {deanOptions.map((d) => <option key={d.id} value={d.id}>{d.user.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        <button onClick={onCancelAssign}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => onOpenAssign(s.id)} disabled={assigning}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50">
                        {s.school_dean?.user?.name ? "Reassign" : "Assign"}
                      </button>
                    )}
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-3.5">
                    <button onClick={() => onDelete(s.id)} disabled={deletingId === s.id}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      title="Delete school">
                      {deletingId === s.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
