"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  roles?: { role: { name: string } }[];
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            User Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage system users and their roles
          </p>
        </div>

        <Link
          href="/admin/create-user"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition w-full sm:w-auto"
        >
          + Add User
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-8 text-sm text-slate-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center space-y-3">

            <p className="text-slate-500 text-sm">
              No users found
            </p>

          
          </div>

        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-150 text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-600">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 transition"
                  >

                    <td className="px-6 py-4 font-medium text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 break-all">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">

                        {u.roles?.length ? (
                          u.roles.map((r, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {r.role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            No role
                          </span>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}