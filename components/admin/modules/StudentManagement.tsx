"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Student = {
  id: string;
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  year: number;
  userId?: string;
  advisorId?: string;
  advisor?: { user?: { name: string } };
  department?: { name: string };
};

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Student Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage student accounts and advisors
          </p>
        </div>

      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-6 text-sm text-slate-500">
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No students found
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-600">
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Advisor Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">

                {students.map((s) => {
                  const hasAccount = !!s.userId;
                  const hasAdvisor = !!s.advisorId;

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {s.studentId}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {s.firstName} {s.middleName} {s.lastName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        Year {s.year}
                      </td>

                      <td className="px-6 py-4">
                        {s.department?.name ? (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {s.department.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasAccount ? (
                          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Account Created
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                            Pending Account
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasAdvisor ? (
                          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            Advisor Assigned
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            No Advisor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={
                              hasAccount
                                ? "#"
                                : `/admin/create-student-account?studentId=${s.studentId}`
                            }
                            onClick={(e) => hasAccount && e.preventDefault()}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition
                              ${
                                hasAccount
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-indigo-600 text-white hover:bg-indigo-700"
                              }
                            `}
                          >
                            {hasAccount ? "Created" : "Create"}
                          </Link>
                          <Link
                            href={
                              hasAdvisor
                                ? "#"
                                : `/admin/assign-advisor?studentId=${s.studentId}`
                            }
                            onClick={(e) => hasAdvisor && e.preventDefault()}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition
                              ${
                                hasAdvisor
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                              }
                            `}
                          >
                            {hasAdvisor ? "Assigned" : "Assign"}
                          </Link>

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}