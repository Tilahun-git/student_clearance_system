"use client";

import { Student } from "@/types/clearance";
import { RefreshCw } from "lucide-react";

type Props = {
  students: Student[];
  selectedStudents: string[];
  onToggleStudent: (studentId: string) => void;
  onToggleAll: () => void;
  /** Called when the Reassign button is clicked for a specific student */
  onReassign: (student: Student) => void;
};

export default function StudentAdvisorTable({
  students,
  selectedStudents,
  onToggleStudent,
  onToggleAll,
  onReassign,
}: Props) {
  // Only unassigned students count toward "all selected"
  const unassigned = students.filter((s) => !s.advisorId);
  const allUnassignedSelected =
    unassigned.length > 0 && unassigned.every((s) => selectedStudents.includes(s.studentId));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        {students.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No students found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 w-14">
                  {/* Header checkbox only selects unassigned students */}
                  <input
                    type="checkbox"
                    checked={allUnassignedSelected}
                    onChange={onToggleAll}
                    disabled={unassigned.length === 0}
                    title={unassigned.length === 0 ? "All students already have advisors" : "Select all unassigned"}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </th>
                <th className="text-left p-4 font-semibold">Student ID</th>
                <th className="text-left p-4 font-semibold">First Name</th>
                <th className="text-left p-4 font-semibold">Middle Name</th>
                <th className="text-left p-4 font-semibold">Last Name</th>
                <th className="text-left p-4 font-semibold">Advisor</th>
                <th className="text-left p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const isAssigned = Boolean(student.advisorId);
                const selected = selectedStudents.includes(student.studentId);

                return (
                  <tr
                    key={student.studentId}
                    className={`border-b last:border-0 transition hover:bg-slate-50 ${
                      selected ? "bg-indigo-50" : ""
                    }`}
                  >
                    {/* Checkbox — disabled for already-assigned students */}
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleStudent(student.studentId)}
                        disabled={isAssigned}
                        title={isAssigned ? "Already assigned — use Reassign to change" : ""}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>

                    <td className="p-4 font-medium text-slate-700">{student.studentId}</td>
                    <td className="p-4 text-slate-700">{student.firstName}</td>
                    <td className="p-4 text-slate-500">
                      {student.middleName || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-4 text-slate-700">{student.lastName}</td>

                    {/* Advisor badge */}
                    <td className="p-4">
                      {student.advisor?.user?.name ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {student.advisor.user.name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Reassign button — only for assigned students */}
                    <td className="p-4">
                      {isAssigned ? (
                        <button
                          onClick={() => onReassign(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                        >
                          <RefreshCw size={12} />
                          Reassign
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
