"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Briefcase, CheckCircle2, Clock3, GraduationCap, Users } from "lucide-react";
import { socket } from "@/lib/socket";
import { CLEARANCE_SOCKET_EVENT } from "@/lib/clearance/clearanceSocketIo";

export type RoleScope = "DEPARTMENT_HEAD" | "SCHOOL_DEAN";

type SummaryData = {
  entityName: string;
  schoolName: string | null;
  activeStudents: number;
  pendingRequests: number;
  approvedToday: number;
  totalHandled: number;
};

type Props = {
  role: RoleScope;
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: "slate" | "emerald" | "amber" | "indigo";
}) {
  const toneStyles = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
  };

  const valueStyles = {
    slate: "text-slate-900",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    indigo: "text-indigo-700",
  };

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${toneStyles[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-inherit/80">
          {label}
        </p>
      </div>
      <p className={`mt-2 text-lg font-bold tabular-nums ${valueStyles[tone]}`}>{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 animate-pulse">
      <div className="h-3 w-24 bg-slate-100 rounded" />
      <div className="mt-3 h-5 w-12 bg-slate-100 rounded" />
    </div>
  );
}

export default function RoleScopeDashboardHeader({ role }: Props) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/dashboard/role-summary?role=${encodeURIComponent(role)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to load dashboard summary");
      }

      setError(null);
      setData(json as SummaryData);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard summary");
        setData(null);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [role]);

  useEffect(() => {
    let active = true;

    const runLoad = async () => {
      await loadSummary(false);
      if (!active) {
        return;
      }
    };

    runLoad();

    return () => {
      active = false;
    };
  }, [loadSummary]);

  useEffect(() => {
    const handleRealtimeUpdate = () => {
      loadSummary(true);
    };

    socket.on(CLEARANCE_SOCKET_EVENT, handleRealtimeUpdate);

    return () => {
      socket.off(CLEARANCE_SOCKET_EVENT, handleRealtimeUpdate);
    };
  }, [loadSummary]);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="h-1 bg-linear-to-r from-indigo-500 via-sky-500 to-emerald-400" />
      <div className="px-4 py-3 sm:px-5">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Unable to load dashboard summary</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : data ? (
          <>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {role === "DEPARTMENT_HEAD"
                ? `Department Overview • ${data.entityName}${data.schoolName ? ` • ${data.schoolName}` : ""}`
                : `School Overview • ${data.entityName}`}
            </p>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
              <StatCard
                icon={Users}
                label="Active Students"
                value={data.activeStudents}
                tone="slate"
              />
              <StatCard
                icon={Clock3}
                label="Pending Requests"
                value={data.pendingRequests}
                tone="amber"
              />
              <StatCard
                icon={CheckCircle2}
                label="Approved Today"
                value={data.approvedToday}
                tone="emerald"
              />
              <StatCard
                icon={role === "DEPARTMENT_HEAD" ? Briefcase : GraduationCap}
                label="Handled Requests"
                value={data.totalHandled}
                tone="indigo"
              />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
