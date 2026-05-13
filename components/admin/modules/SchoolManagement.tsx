"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type School = {
  id: string;

  name: string;

  faculty?: {
    name?: string;
  };

  school_dean?: {
    user?: {
      name?: string;
    };
  };
};

export default function SchoolManagement() {

  const [schools, setSchools] = useState<School[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/school")
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-full p-6 rounded-xl">

      {/* HEADER */}
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
          className="
            bg-green-600 hover:bg-green-700
            text-white px-4 py-2
            rounded-lg shadow-sm transition
          "
        >
          + Add School
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
              <th className="text-left p-4">School Name</th>
              <th className="text-left p-4">Faculty</th>
              <th className="text-left p-4">Dean</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">
                  No schools found
                </td>
              </tr>
            ) : (

              schools.map((s) => (

                <tr key={s.id} className="border-t hover:bg-gray-50">

                  <td className="p-4 font-medium text-gray-900">
                    {s.name}
                  </td>

                  <td className="p-4 text-gray-700">
                    {s.faculty?.name ?? (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>

                  <td className="p-4">

                    {s.school_dean?.user?.name ? (
                      <span className="
                        inline-flex px-3 py-1
                        rounded-full bg-emerald-100
                        text-emerald-700 text-xs font-medium
                      ">
                        {s.school_dean.user.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        No dean assigned
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