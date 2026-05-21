"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import RoleApprovalPage from "@/components/layout/RoleApprovalPage";
import { DASHBOARD_CONTAINER_CLASS } from "@/components/layout/NoSidebarDashboardLayout";

export default function RegistrarPage() {
  return (
    <>
      <Header />
      <div className={`${DASHBOARD_CONTAINER_CLASS} space-y-5 -mt-1`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-slate-800">Registrar Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage student clearance approvals and registrations
            </p>
          </div>
          <Link
            href="/registrar/register-student"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition"
          >
            Register Student
          </Link>
        </div>

        <RoleApprovalPage role="REGISTRAR" />
      </div>
    </>
  );
}
