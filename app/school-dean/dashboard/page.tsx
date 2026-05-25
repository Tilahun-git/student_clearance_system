"use client";

import RoleApprovalPage from "@/components/layout/RoleApprovalPage";
import RoleScopeDashboardHeader from "@/components/layout/RoleScopeDashboardHeader";

export default function SchoolDeanPage() {
  return (
    <div className="space-y-5">
      <RoleScopeDashboardHeader role="SCHOOL_DEAN" />
      <RoleApprovalPage role="SCHOOL_DEAN" />
    </div>
  );
}