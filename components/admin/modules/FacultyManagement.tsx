"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

type Faculty = {
  id: string;

  name: string;

  faculty_dean?: {
    user?: {
      name?: string;
    };
  } | null;
};

export default function FacultyManagement() {

  const [faculties, setFaculties] =
    useState<Faculty[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadFaculties() {

    try {

      const res =
        await fetch("/api/faculty");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch faculties"
        );
      }

      setFaculties(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaculties();
  }, []);

  return (
    <div className="bg-gray-50 min-h-full p-6 rounded-xl">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-semibold text-gray-900">
            Faculty Management
          </h2>

          <p className="text-sm text-gray-500">
            Manage faculties and faculty deans
          </p>

        </div>

        <Link
          href="/admin/manage-faculty/add-faculty"
          className="
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            px-4
            py-2
            rounded-lg
            shadow-sm
            transition
          "
        >
          + Add Faculty
        </Link>

      </div>

      <div className="
        bg-white
        border
        border-gray-200
        rounded-xl
        shadow-sm
        overflow-hidden
      ">

        <table className="w-full text-sm">

          <thead className="
            bg-gray-50
            text-gray-600
            uppercase
            text-xs
            tracking-wider
          ">
            <tr>

              <th className="text-left p-4">
                Faculty Name
              </th>

              <th className="text-left p-4">
                Dean
              </th>

            </tr>
          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan={2}
                  className="
                    p-10
                    text-center
                    text-gray-400
                  "
                >
                  Loading faculties...
                </td>
              </tr>

            ) : faculties.length === 0 ? (

              <tr>
                <td
                  colSpan={2}
                  className="
                    p-10
                    text-center
                    text-gray-400
                  "
                >
                  No faculties found
                </td>
              </tr>

            ) : (

              faculties.map((faculty) => (

                <tr
                  key={faculty.id}
                  className="
                    border-t
                    hover:bg-gray-50
                    transition
                  "
                >

                  <td className="
                    p-4
                    font-medium
                    text-gray-900
                  ">
                    {faculty.name}
                  </td>

                  <td className="p-4">

                    {faculty.faculty_dean?.user
                      ?.name ? (
                      <span
                        className="
                          inline-flex
                          items-center
                          px-3
                          py-1
                          rounded-full
                          bg-indigo-100
                          text-indigo-700
                          text-xs
                          font-medium
                        ">
                        {
                          faculty
                            .faculty_dean
                            .user.name
                        }
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