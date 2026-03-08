"use client";

import Image from "next/image";
import { Home, Users, Building2, Settings, FileText } from "lucide-react";

export default function AdminDashboard() {
  const users = [
    { id: "U123", name: "Alemu Henok", role: "Admin", status: "Active" },
    { id: "U124", name: "Abebe Minaye", role: "Registrar", status: "Active" },
    { id: "U125", name: "Fasil Demeke", role: "Advisor", status: "Active" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="flex flex-col items-center py-6 border-b border-blue-700">
          <Image
            src="/wldu_logo.jpg"
            alt="Woldia University"
            width={70}
            height={70}
            className="rounded-full"
          />
          <h2 className="mt-2 font-bold text-sm text-center">
            WOLDIA UNIVERSITY
          </h2>
        </div>

        <nav className="flex flex-col gap-3 p-4 text-sm">

          <SidebarItem icon={<Home size={18} />} label="Home" />
          <SidebarItem icon={<Users size={18} />} label="Students" />
          <SidebarItem icon={<Building2 size={18} />} label="Departments" />
          <SidebarItem icon={<Settings size={18} />} label="Settings" />
          <SidebarItem icon={<FileText size={18} />} label="Reports" />

        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-green-200 p-4 flex justify-between items-center shadow">

          <h1 className="text-lg font-bold text-blue-900">
            WDU STUDENT CLEARANCE SYSTEM
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-sm">Admin</span>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              A
            </div>
          </div>

        </header>

        {/* Content */}
        <div className="p-6 space-y-6">

          <h2 className="text-center font-semibold text-blue-800">
            ADMIN DASHBOARD
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">

            <StatCard title="Total students" value="5432" />
            <StatCard title="Active clearance requests" value="320" />
            <StatCard title="Departments" value="10" />
            <StatCard title="System users" value="45" />

          </div>

          {/* User Management */}
          <div className="bg-white rounded-xl shadow p-4">

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">User Management</h3>

              <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700">
                Create User
              </button>
            </div>

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b text-gray-600">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left">Name</th>
                  <th className="text-left">Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (
                  <tr key={user.id} className="border-b">

                    <td className="py-2">{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.role}</td>

                    <td className="text-center">
                      <span className="bg-green-200 text-green-700 px-3 py-1 rounded-full text-xs">
                        {user.status}
                      </span>
                    </td>

                    <td className="flex gap-2 justify-center py-2">

                      <button className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs">
                        Deactivate
                      </button>

                      <button className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                        Activate
                      </button>

                      <button className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                        Update
                      </button>

                      <button className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* Footer */}
        <footer className="bg-gray-300 text-center text-xs py-3 mt-auto">
          © 2026 Woldia University - Student Clearance System
        </footer>

      </main>

    </div>
  );
}

function SidebarItem({ icon, label }: any) {
  return (
    <div className="flex items-center gap-3 hover:bg-blue-700 p-2 rounded cursor-pointer">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-green-100 border-l-4 border-blue-500 p-4 rounded shadow text-center">
      <p className="text-xs text-gray-600">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}