"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { School } from "@/types/clearance";

export default function SchoolManagement() {
  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/school")
      .then((res) => res.json())
      .then(setSchools);
  }, []);

  return (
    <div className="bg-gray-50 min-h-full p-6 rounded-xl">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            School Management
          </h2>
          <p className="text-sm text-gray-500">
            Manage schools and assign deans
          </p>
        </div>

        <Link
          href="/admin/manage-faculty/add-school"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
        >
          + Add School
        </Link>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="text-left p-4">School Name</th>
              <th className="text-left p-4">Faculty</th>
              <th className="text-left p-4">Dean</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((s) => (
              <tr
                key={s.id}
                className="border-t hover:bg-gray-50 transition"
              >
               <td className="p-4 font-medium text-gray-900">
                  {s.name}
                </td>
                <td className="p-4 text-gray-700">
                  {s.faculty?.name || (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </td>
                <td className="p-4">
                  {s.dean?.user?.name ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                      {s.dean.user.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">No dean assigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}