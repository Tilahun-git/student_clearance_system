"use client";

import { Users, FileText, School, User } from "lucide-react";

export default function AdminHeader() {
  return (
    <div className="w-full px-6 py-6 bg-gray-100">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 italic text-sm uppercase tracking-wide">
            Students
          </p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            2345
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 italic text-sm uppercase tracking-wide">
            Departments
          </p>
          <h2 className="text-3xl font-bold text-purple-600 mt-2">
            54
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-green-500">
          <p className="text-gray-500 italic text-sm uppercase tracking-wide">
            Schools
          </p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            23
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-indigo-500">
          <p className="text-gray-500 italic text-sm uppercase tracking-wide">
            Users
          </p>
          <h2 className="text-3xl font-bold text-indigo-600 mt-2">
            132
          </h2>
        </div>

      </div>
    </div>
  );
}