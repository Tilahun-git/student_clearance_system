"use client";

import Link from "next/link";
import { Users, Building2, School, FileText } from "lucide-react";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import AdminHeader from "@/components/layout/AdminHeader";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col">
      
      <DashBoardNavbar />

      <main className="flex-1 p-5 md:p-8 space-y-8">

        <AdminHeader />

        <div className="grid grid-cols-3 gap-4">

          <Link
            href="/admin/manage-faculty/add-faculty"
            className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition flex items-center gap-3"
          >
            <div className="p-3 bg-blue-100  text-blue-600 rounded-lg group-hover:scale-105 transition">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Add Faculty
              </h3>
              <p className="text-xs text-gray-500">
                Create faculty
              </p>
            </div>
          </Link>

          <Link
            href="/admin/manage-faculty/add-school"
            className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition flex items-center gap-3"
          >
            <div className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:scale-105 transition">
              <School size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Add School
              </h3>
              <p className="text-xs text-gray-500">
                Under faculty
              </p>
            </div>
          </Link>

          <Link
            href="/admin/manage-faculty/add-department"
            className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition flex items-center gap-3"
          >
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-105 transition">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Add Department
              </h3>
              <p className="text-xs text-gray-500">
                Under school
              </p>
            </div>
          </Link>

        </div>

        {/* 👥 User Table */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md border border-gray-200 p-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} />
              Users
            </h2>

            <Link
              href="/admin/create-user"
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium shadow hover:opacity-90 transition w-full md:w-auto text-center"
            >
              + Create User
            </Link>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3">ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {[1, 2, 3].map((item) => (
                  <tr
                    key={item}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="py-4 text-gray-600">#00{item}</td>

                    <td className="font-medium text-gray-800">
                      John Doe
                    </td>

                    <td className="text-gray-600">
                      john@email.com
                    </td>

                    <td>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        STUDENT
                      </span>
                    </td>

                    <td>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>

                    {/* 🎯 Better Action Button Layout */}
                    <td className="text-center">
                      <div className="flex justify-center items-center gap-2 flex-wrap">

                        <button className="px-3 py-1 text-xs rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition">
                          Deactivate
                        </button>

                        <button className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition">
                          Edit
                        </button>

                        <button className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 transition">
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          </div>

        </div>

      </main>

  

    </div>
  );
}