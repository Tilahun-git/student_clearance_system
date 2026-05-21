"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ClipboardCheck, Clock3, CheckCircle2, XCircle,
  FileText, Users, GraduationCap, Briefcase,
  TrendingUp, CalendarCheck,
} from "lucide-react";
import { fetchClearanceProgress, type ClearanceProgressData } from "@/lib/api/student";
import {
  fetchClearanceStatus,
  type StaffStatus,
} from "@/lib/api/status";

function statusBadgeClass(s: string | null) {
  if (s === "APPROVED")    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "REJECTED")    return "bg-red-50 text-red-600 border-red-200";
  if (s === "IN_PROGRESS") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (s === "PENDING")     return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-500 border-slate-200";
}

function statusLabel(s: string | null, hasRequest: boolean) {
  if (!hasRequest || !s) return "Not Started";
  return s.replace(/_/g, " ");
}

function Pill({
  icon: Icon,
  label,
  value,
  valueClass = "text-slate-700",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-xs text-slate-500 whitespace-nowrap">{label}:</span>
      <span className={`text-xs font-semibold whitespace-nowrap ${valueClass}`}>{value}</span>
    </div>
  );
}

function SkeletonPill() {
  return <div className="skeleton h-7 w-28 rounded-lg" />;
}

export default function Header() {
  const { data: session, status: sessionStatus } = useSession();
  const [studentData, setStudentData] = useState<ClearanceProgressData | null>(null);
  const [staffData, setStaffData] = useState<StaffStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const isStudent = session?.user?.roles?.includes("STUDENT") ?? false;

  useEffect(() => {
    if (sessionStatus === "loading") return;

    setLoading(true);
    const load = isStudent
      ? fetchClearanceProgress()
          .then((json) => setStudentData(json))
          .catch(() => setStudentData(null))
      : fetchClearanceStatus()
          .then((json) => {
            if (json && json.role === "STAFF") setStaffData(json);
          })
          .catch(() => setStaffData(null));

    load.finally(() => setLoading(false));
  }, [sessionStatus, isStudent]);

  const primaryRole = session?.user?.roles?.[0] ?? "";

  const roleIconMap: Record<string, React.ElementType> = {
    ADVISOR: Users, DEPARTMENT_HEAD: Briefcase, SCHOOL_DEAN: GraduationCap,
    REGISTRAR: CalendarCheck, LIBRARY: FileText, CAFETERIA: Briefcase,
    DORMITORY: Briefcase, CAMPUS_POLICE: Briefcase, STUDENT_DEAN: Users,
  };
  const RoleIcon = roleIconMap[primaryRole] ?? ClipboardCheck;

  const hasRequest = (studentData?.approvals?.length ?? 0) > 0;
  const progressPct =
    studentData && studentData.totalCount > 0
      ? Math.round((studentData.approvedCount / studentData.totalCount) * 100)
      : 0;

  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonPill key={i} />)
        ) : isStudent ? (
          <>
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${statusBadgeClass(
                hasRequest ? studentData?.requestStatus ?? null : null,
              )}`}
            >
              {statusLabel(studentData?.requestStatus ?? null, hasRequest)}
            </span>
            {hasRequest && studentData!.totalCount > 0 && (
              <>
                <Pill
                  icon={CheckCircle2}
                  label="Approved"
                  value={`${studentData!.approvedCount}/${studentData!.totalCount}`}
                  valueClass="text-emerald-700"
                />
                <Pill
                  icon={TrendingUp}
                  label="Progress"
                  value={`${progressPct}%`}
                  valueClass={progressPct === 100 ? "text-emerald-700" : "text-indigo-700"}
                />
              </>
            )}
            {(studentData?.rejections ?? 0) > 0 && (
              <Pill
                icon={XCircle}
                label="Rejected"
                value={studentData!.rejections}
                valueClass="text-red-600"
              />
            )}
            {studentData?.clearanceType && studentData.clearanceType !== "—" && (
              <Pill icon={FileText} label="Type" value={studentData.clearanceType} />
            )}
          </>
        ) : staffData ? (
          <>
            <Pill
              icon={Clock3}
              label="Pending"
              value={staffData.pendingCount}
              valueClass={staffData.pendingCount > 0 ? "text-amber-700" : "text-slate-600"}
            />
            <Pill icon={CheckCircle2} label="Today" value={staffData.approvedToday} valueClass="text-emerald-700" />
            <Pill icon={RoleIcon} label="Total" value={staffData.totalHandled} />
          </>
        ) : null}
      </div>
    </div>
  );
}
