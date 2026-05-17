"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ClipboardCheck, Clock3, CheckCircle2, XCircle,
  FileText, Users, GraduationCap, Briefcase,
  TrendingUp, CalendarCheck,
} from "lucide-react";
import {
  fetchClearanceStatus,
  type StatusData,
  type StudentStatus,
  type StaffStatus,
} from "@/lib/api/status";

function statusBadgeClass(s: string | null) {
  if (s === "APPROVED")    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "REJECTED")    return "bg-red-50 text-red-600 border-red-200";
  if (s === "IN_PROGRESS") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (s === "PENDING")     return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-500 border-slate-200";
}

function statusLabel(s: string | null) {
  if (!s || s === "NOT_STARTED") return "Not Started";
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
  const [data, setData] = useState<StatusData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    fetchClearanceStatus()
      .then((json) => { if (json) setData(json); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionStatus]);

  const primaryRole = session?.user?.roles?.[0] ?? "";

  const roleIconMap: Record<string, React.ElementType> = {
    ADVISOR: Users, DEPARTMENT_HEAD: Briefcase, SCHOOL_DEAN: GraduationCap,
    REGISTRAR: CalendarCheck, LIBRARY: FileText, CAFETERIA: Briefcase,
    DORMITORY: Briefcase, CAMPUS_POLICE: Briefcase, STUDENT_DEAN: Users,
    FINANCE: TrendingUp,
  };
  const RoleIcon = roleIconMap[primaryRole] ?? ClipboardCheck;

  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonPill key={i} />)
        ) : !data || data.role === "STUDENT" ? (
          (() => {
            const s = data as StudentStatus | null;
            return (
              <>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${statusBadgeClass(s?.requestStatus ?? null)}`}>
                  {statusLabel(s?.requestStatus ?? null)}
                </span>
                <Pill
                  icon={CheckCircle2}
                  label="Steps"
                  value={s && s.totalSteps > 0 ? `${s.approvedSteps}/${s.totalSteps}` : "—"}
                  valueClass="text-emerald-700"
                />
                {(s?.rejections ?? 0) > 0 && (
                  <Pill icon={XCircle} label="Rejected" value={s!.rejections} valueClass="text-red-600" />
                )}
                {s?.clearanceType && s.clearanceType !== "—" && (
                  <Pill icon={FileText} label="Type" value={s.clearanceType} />
                )}
              </>
            );
          })()
        ) : (
          (() => {
            const s = data as StaffStatus;
            return (
              <>
                <Pill icon={Clock3} label="Pending" value={s.pendingCount} valueClass={s.pendingCount > 0 ? "text-amber-700" : "text-slate-600"} />
                <Pill icon={CheckCircle2} label="Today" value={s.approvedToday} valueClass="text-emerald-700" />
                <Pill icon={RoleIcon} label="Total" value={s.totalHandled} />
              </>
            );
          })()
        )}
      </div>
    </div>
  );
}
