"use client";

import Link from "next/link";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Header from "@/components/layout/Header";
import RoleApprovalPage from "@/components/layout/RoleApprovalPage";

export default function RegistrarPage() {
  return (
    <div className="min-h-screen w-full bg-slate-100">
      <DashBoardNavbar />
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Registrar Dashboard
            </h1>
         
          </div>

          <Link
            href="/registrar/register-student"
            className="
              inline-flex items-center gap-2
              bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-medium
              px-4 py-2 rounded-xl shadow-sm transition
            ">
           Register Student
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <RoleApprovalPage role="REGISTRAR" />
        </div>

      </div>
    </div>
  );
}