"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users ,UserPlus} from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";

type Student = {
  id: string;
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  program: string;
  year: number;
  userId?: string;
  advisorId?: string; 
  advisor?: { user?: { name: string } };
  department?: { name: string };
};

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch("/api/students")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then(setStudents)
      .catch(() => console.error("Failed to load students"));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        <AdminHeader />

       <div className="bg-white rounded-2xl shadow-md border p-6 flex justify-between items-center">
  
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={22} />
            Student Management
          </h2>

         <Link
          href="/admin/create-user"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-indigo-700 transition-all duration-200"
        >
          <UserPlus size={18} />
          Add User
        </Link>

        </div>

        <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 font-bold border-b">
                <tr className="text-left text-xs uppercase text-gray-600 tracking-wider">
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Advisor Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {students.map((s) => {
                  const hasAccount = !!s.userId;
                  const hasAdvisor = !!s.advisorId; 

                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition">

                      <td className="px-6 py-4 font-medium text-gray-700">
                        {s.studentId}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {s.firstName} {s.middleName} {s.lastName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        Year {s.year}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {s.department?.name || "-"}
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
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
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
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                              }
                            `}
                          >
                            {hasAdvisor ? "Already Assigned" : "Assign Advisor"}
                          </Link>

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        </div>

      </main>
    </div>
  );
}