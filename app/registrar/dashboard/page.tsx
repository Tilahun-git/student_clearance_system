"use client";

import Link from "next/link";
import Image from "next/image";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";

export default function Registrar() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-start">
      <DashBoardNavbar/>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link
          href="/registrar/register-student"
          className="bg-white shadow-lg hover:shadow-xl transition p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-indigo-50"
        >
          <div className="text-indigo-600 mb-3 text-3xl font-bold">📝</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Register Student
          </h2>
          <p className="text-gray-600 text-sm">
            Add new students with existing faculties, schools, departments, programs, and advisors.
          </p>
        </Link>

      </div>
    </div>
  );
}