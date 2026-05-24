"use client";

import Link from "next/link";

export type StudentRow = {
  id: string;
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  year: number;
  userId?: string;
  department?: { name: string };
};

function SkeletonRow() {
  return (
    <tr>{[1,2,3,4,5].map((i) => (
      <td key={i} className="px-5 py-4"><div className="skeleton h-4 rounded w-3/4" /></td>
    ))}</tr>
  );
}

type Props = {
  students: StudentRow[];
  loading: boolean;
  search: string;
};

export default function StudentTable({ students, loading, search }: Props) {
  const hasRows = !loading && students.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {hasRows && (
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Student ID</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Year</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5 text-center">Account</th>
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                  {search ? "No students match your search." : "No students found."}
                </td>
              </tr>
            ) : (
              students.map((s) => {
                const hasAccount = !!s.userId;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-700">{s.studentId}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {s.firstName} {s.middleName} {s.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">Yr {s.year}</td>
                    <td className="px-5 py-3.5">
                      {s.department?.name ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {s.department.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {hasAccount ? (
                        <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-green-50 text-green-700 border border-green-100">
                          Active
                        </span>
                      ) : (
                        <Link href={`/admin/create-student-account?studentId=${s.studentId}`}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                          Create Account
                        </Link>
                      )}
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
