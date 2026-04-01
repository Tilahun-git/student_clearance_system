"use client";

import Link from "next/link";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";

export default function Registrar() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <DashBoardNavbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Registrar Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage student records and registration processes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <Link
            href="/registrar/register-student"
            className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
          >
            <div className="text-5xl mb-4 transition-transform group-hover:scale-110">
              🎓
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Register Student
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed">
              Add new students and assign them to departments, programs,
              and advisors efficiently.
            </p>

            <div className="mt-5 text-indigo-600 text-sm font-medium group-hover:underline">
              Get Started →
            </div>
          </Link>

        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          Registrar actions are logged and secured.
        </div>

      </div>
    </div>
  );
}