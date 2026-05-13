"use client";

import { Student } from "@/types/clearance";

type Props = {
  students: Student[];
  selectedStudents: string[];

  onToggleStudent: (
    studentId: string
  ) => void;

  onToggleAll: () => void;
};

export default function StudentAdvisorTable({students,selectedStudents,onToggleStudent,onToggleAll,}: Props) {

  const allSelected = students.length > 0 && selectedStudents.length === students.length;
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
             {students.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  No students found
                </div>
                    ):(
         <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr className="text-sm text-slate-600">
              <th className="p-4 w-14">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="text-left p-4 font-semibold">
                Student ID
              </th>
              <th className="text-left p-4 font-semibold">
                Student Name
              </th>
              <th className="text-left p-4 font-semibold">
                Advisor
              </th>
            </tr>
          </thead>
          <tbody>
              {students.map((student) => {
                const selected = selectedStudents.includes(student.studentId);
                return (
                  <tr key={student.studentId}
                    className={`border-b last:border-0 transition hover:bg-slate-50 ${selected
                        ? "bg-indigo-50"
                        : ""
                    }`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleStudent(student.studentId)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {student.studentId}
                    </td>
                    <td className="p-4 text-slate-700">
                      {student.firstName}{" "}
                      {student.middleName}{" "}
                      {student.lastName}
                    </td>
                    <td className="p-4">
                      {student.advisor?.user
                        ?.name ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {student.advisor.user.name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>)}
      </div>
    </div>
  );
}