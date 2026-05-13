"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Department = {
  id: string;

  name: string;

  school?: {
    name?: string;
  };

  head?: {
    user?: {
      name?: string;
    };
  };
};

export default function DepartmentManagement() {

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/department")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-full p-6 rounded-xl">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-semibold text-gray-900">
          Department Management
        </h2>

        <Link
          href="/admin/manage-faculty/add-department"
          className="
            bg-purple-600 hover:bg-purple-700
            text-white px-4 py-2
            rounded-lg shadow-sm transition
          "
        >
          + Add Department
        </Link>

      </div>

      {/* TABLE */}
      <div className="
        bg-white border border-gray-200
        rounded-xl shadow-sm overflow-hidden
      ">

        <table className="w-full text-sm">

          <thead className="
            bg-gray-50 text-gray-600
            uppercase text-xs tracking-wider
          ">
            <tr>

              <th className="text-left p-4">
                Department
              </th>

              <th className="text-left p-4">
                School
              </th>

              <th className="text-left p-4">
                Head
              </th>

            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">
                  No departments found
                </td>
              </tr>
            ) : (

              departments.map((d) => (

                <tr key={d.id} className="border-t hover:bg-gray-50">

                  <td className="p-4 font-medium text-gray-900">
                    {d.name}
                  </td>

                  <td className="p-4 text-gray-700">
                    {d.school?.name ?? (
                      <span className="text-gray-400">
                        Not assigned
                      </span>
                    )}
                  </td>

                  <td className="p-4">

                    {d.head?.user?.name ? (
                      <span className="
                        inline-flex px-3 py-1
                        rounded-full bg-indigo-100
                        text-indigo-700 text-xs font-medium
                      ">
                        {d.head.user.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        No head assigned
                      </span>
                    )}

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