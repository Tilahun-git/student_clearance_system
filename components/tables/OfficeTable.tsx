"use client";

import { Briefcase, ChevronDown, X, Trash2, Loader2 } from "lucide-react";

export type OfficeRow = {
  id: string;
  office_name: string;
  code: string;
  manager?: { user?: { name?: string } };
};

const OFFICE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LIBRARY:       { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100"   },
  DORMITORY:     { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  CAFETERIA:     { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100" },
  CAMPUS_POLICE: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-100"    },
  STUDENT_DEAN:  { bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-100"   },
  REGISTRAR:     { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-100"   },
  FINANCE:       { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-100"  },
};

function SkeletonRow() {
  return (
    <tr>{[1,2,3,4,5].map((i) => (
      <td key={i} className="px-5 py-4"><div className="skeleton h-4 rounded w-3/4" /></td>
    ))}</tr>
  );
}

type Props = {
  offices: OfficeRow[];
  loading: boolean;
  selectedOffice: string | null;
  staffOptions: any[];
  assigning: boolean;
  deletingId: string | null;
  onLoadStaff: (code: string, officeId: string) => void;
  onAssignManager: (officeId: string, staffId: string) => void;
  onCancelAssign: () => void;
  onDelete: (id: string) => void;
};

export default function OfficeTable({
  offices, loading, selectedOffice, staffOptions, assigning, deletingId,
  onLoadStaff, onAssignManager, onCancelAssign, onDelete,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Office</th>
              <th className="px-5 py-3.5">Code</th>
              <th className="px-5 py-3.5">Manager</th>
              <th className="px-5 py-3.5">Assign</th>
              <th className="px-5 py-3.5">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : offices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">No offices found.</td>
              </tr>
            ) : (
              offices.map((office) => {
                const colors = OFFICE_COLORS[office.code] ?? { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
                return (
                  <tr key={office.id} className="hover:bg-slate-50 transition-colors">
                    {/* Office name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors.bg}`}>
                          <Briefcase className={`w-3.5 h-3.5 ${colors.text}`} />
                        </div>
                        <p className="font-medium text-slate-800 text-sm">{office.office_name}</p>
                      </div>
                    </td>

                    {/* Code badge */}
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {office.code}
                      </span>
                    </td>

                    {/* Manager */}
                    <td className="px-5 py-3.5">
                      {office.manager?.user?.name ? (
                        <span className="text-xs font-medium text-slate-700">{office.manager.user.name}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Not assigned
                        </span>
                      )}
                    </td>

                    {/* Assign / Reassign */}
                    <td className="px-5 py-3.5">
                      {selectedOffice === office.id ? (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <select onChange={(e) => onAssignManager(office.id, e.target.value)} defaultValue=""
                              className="w-full appearance-none pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                              <option value="" disabled>Select staff…</option>
                              {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.user.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          </div>
                          <button onClick={onCancelAssign}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => onLoadStaff(office.code, office.id)} disabled={assigning}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50">
                          {office.manager?.user?.name ? "Reassign" : "Assign"}
                        </button>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="px-5 py-3.5">
                      <button onClick={() => onDelete(office.id)} disabled={deletingId === office.id}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                        title="Delete office">
                        {deletingId === office.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
