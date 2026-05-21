"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {ClipboardCheck,Clock3,CheckCircle2,XCircle,FileText,Users,GraduationCap,Briefcase,
  CalendarCheck,FileCheck2,CircleDashed,AlertCircle,} from "lucide-react";
import type { ClearanceProgressData } from "@/lib/api/student";
import { fetchClearanceStatus, type StaffStatus } from "@/lib/api/status";
import { DASHBOARD_CONTAINER_CLASS } from "@/components/layout/NoSidebarDashboardLayout";
import { useClearanceSync } from "@/contexts/ClearanceRealtimeContext";
import { ClearanceStatus } from "@prisma/client";

type HeaderProps = {
  progressData?: ClearanceProgressData | null;
  progressLoading?: boolean;
};

function statusConfig(status: ClearanceStatus | null, hasRequest: boolean) {
  if (!hasRequest || !status) {
    return {
      label: "Not Started",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
      icon: CircleDashed,
    };
  }
  if (status === ClearanceStatus.APPROVED) {
    return {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      icon: CheckCircle2,
    };
  }
  if (status === ClearanceStatus.REJECTED) {
    return {
      label: "Rejected",
      className: "bg-red-50 text-red-700 ring-red-200",
      icon: XCircle,
    };
  }
  if (status === ClearanceStatus.IN_PROGRESS) {
    return {
      label: "In Progress",
      className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
      icon: Clock3,
    };
  }
  return {
    label: status.replace(/_/g, " "),
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock3,
  };
}

function progressBarColor(pct: number) {
  if (pct === 100) return "from-emerald-500 to-emerald-400";
  if (pct >= 60) return "from-indigo-600 to-indigo-400";
  if (pct >= 30) return "from-amber-500 to-amber-400";
  return "from-slate-400 to-slate-300";
}

function StatCard({
  label,
  value,
  sub,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "slate" | "emerald" | "amber" | "red" | "indigo";
}) {
  const tones = {
    slate: "bg-white border-slate-200 text-slate-800",
    emerald: "bg-emerald-50/80 border-emerald-100 text-emerald-800",
    amber: "bg-amber-50/80 border-amber-100 text-amber-800",
    red: "bg-red-50/80 border-red-100 text-red-800",
    indigo: "bg-indigo-50/80 border-indigo-100 text-indigo-800",
  };
  const valueTones = {
    slate: "text-slate-900",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
    indigo: "text-indigo-700",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 min-w-30 ${tones[tone]}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-xl font-bold mt-0.5 tabular-nums ${valueTones[tone]}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function StudentHeaderSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex justify-between gap-4 mb-5">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 bg-slate-100 rounded" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-100 rounded-full" />
      </div>
      <div className="h-3 bg-slate-100 rounded-full mb-2" />
      <div className="h-2.5 w-48 bg-slate-100 rounded" />
    </div>
  );
}

function StaffHeaderSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-4.5rem rounded-xl bg-white border border-slate-200" />
      ))}
    </div>
  );
}

function StudentProgressHeader({ data }: { data: ClearanceProgressData | null }) {
  const hasRequest = (data?.approvals?.length ?? 0) > 0;
  const approvedCount = data?.approvedCount ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const pendingCount = (data?.approvals ?? []).filter((a) => a.status === "PENDING").length;
  const rejectedCount = data?.rejections ?? 0;
  const progressPct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const status = statusConfig(data?.requestStatus ?? null, hasRequest);
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="h-1 bg-linear-to-r from-indigo-500 via-indigo-400 to-violet-400" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900 leading-tight">
                  Clearance Overview
                </h1>
                {data?.clearanceType && data.clearanceType !== "—" ? (
                  <p className="text-xs text-slate-500 mt-0.5">{data.clearanceType}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">Track your clearance across all offices</p>
                )}
              </div>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${status.className}`}>
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            {status.label}
          </span>
        </div>
        {hasRequest && totalCount > 0 ? (
          <>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <StatCard
                label="Approved"
                value={approvedCount}
                sub={`of ${totalCount} stages`}
                tone="emerald"
              />
              <StatCard label="Pending" value={pendingCount} sub="awaiting action" tone="amber" />
              {rejectedCount > 0 && (
                <StatCard label="Rejected" value={rejectedCount} sub="needs resubmit" tone="red" />
              )}
              <StatCard
                label="Complete"
                value={`${progressPct}%`}
                sub="overall progress"
                tone="indigo"
              />
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-end justify-between gap-3 mb-2">
                <span className="text-xs font-medium text-slate-600">Stage completion</span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    progressPct === 100 ? "text-emerald-600" : "text-indigo-600"
                  }`}>
                  {approvedCount}/{totalCount}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-linear-to-r transition-all duration-700 ease-out ${progressBarColor(progressPct)}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3.5">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              You have not started clearance yet. Submit a request below to begin tracking progress
              across all required offices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StaffStatsHeader({
  data,
  RoleIcon,
}: {
  data: StaffStatus;
  RoleIcon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="h-1 bg-linear-to-r from-slate-400 to-slate-300" />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <RoleIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900">Clearance work Summary</h1>
            <p className="text-xs text-slate-500">Your clearance approval activity</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Pending"
            value={data.pendingCount}
            sub="needs your review"
            tone={data.pendingCount > 0 ? "amber" : "slate"}
          />
          <StatCard label="Approved Today" value={data.approvedToday} sub="processed today" tone="emerald" />
          <StatCard label="Total Handled" value={data.totalHandled} sub="all time" tone="indigo" />
        </div>
      </div>
    </div>
  );
}

export default function Header({ progressData, progressLoading }: HeaderProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [staffData, setStaffData] = useState<StaffStatus | null>(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffReady, setStaffReady] = useState(false);

  const isStudent = session?.user?.roles?.includes("STUDENT") ?? false;
  const usesSharedStudentData = isStudent && progressData !== undefined;

  const loadStaffStats = useCallback(async (silent = false) => {
    if (sessionStatus === "loading" || isStudent) return;

    if (!silent) setStaffLoading(true);

    try {
      const json = await fetchClearanceStatus();
      if (json && json.role === "STAFF") setStaffData(json);
      else setStaffData(null);
    } catch {
      setStaffData(null);
    } finally {
      setStaffLoading(false);
      setStaffReady(true);
    }
  }, [sessionStatus, isStudent]);

  useEffect(() => {
    if (!isStudent) loadStaffStats(false);
  }, [isStudent, loadStaffStats]);

  useClearanceSync(() => loadStaffStats(true), {
    enabled: sessionStatus === "authenticated" && !isStudent,
  });

  const studentData = usesSharedStudentData ? progressData : null;
  const showStudentSkeleton =
    isStudent && (progressLoading || (!usesSharedStudentData && staffLoading));
  const showStaffSkeleton = !isStudent && staffLoading && !staffReady;

  const primaryRole = session?.user?.roles?.[0] ?? "";
  const roleIconMap: Record<string, React.ElementType> = {
    ADVISOR: Users,
    DEPARTMENT_HEAD: Briefcase,
    SCHOOL_DEAN: GraduationCap,
    REGISTRAR: CalendarCheck,
    LIBRARY: FileText,
    CAFETERIA: Briefcase,
    DORMITORY: Briefcase,
    CAMPUS_POLICE: Briefcase,
    STUDENT_DEAN: Users,
  };
  const RoleIcon = roleIconMap[primaryRole] ?? ClipboardCheck;

  return (
    <section className="border-b border-slate-200/70 bg-linear-to-b from-indigo-50/40 via-slate-50 to-slate-50">
      <div className={`${DASHBOARD_CONTAINER_CLASS} py-5 sm:py-6`}>
        {showStudentSkeleton || showStaffSkeleton ? (
          isStudent ? <StudentHeaderSkeleton /> : <StaffHeaderSkeleton />
        ) : isStudent ? (
          <StudentProgressHeader data={studentData ?? null} />
        ) : staffData ? (
          <StaffStatsHeader data={staffData} RoleIcon={RoleIcon} />
        ) : null}
      </div>
    </section>
  );
}
