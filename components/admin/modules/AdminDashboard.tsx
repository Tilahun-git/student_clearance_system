"use client";

import { useEffect, useState } from "react";
import {GraduationCap,Building2,School,Briefcase,Clock3,CheckCircle2,ArrowRight,XCircle,} from "lucide-react";
import Link from "next/link";

import { fetchAdminStats } from "@/lib/api/admin";

// ── Types 

type ActivityItem = {
  id: string;
  studentId: string;
  studentName: string;
  role: string;
  status: "APPROVED" | "REJECTED";
  approvedAt: string;
};

type Stats = {
  totalStudents: number;
  totalSchools: number;
  totalDepartments: number;
  totalOffices: number;
  totalFaculties: number;
  pendingClearances: number;
  approvedClearances: number;
  recentActivity: ActivityItem[];
};

// ── Helpers 

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function activityLabel(item: ActivityItem): string {
  const office = item.role
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return item.status === "APPROVED"
    ? `${office} clearance approved`
    : `${office} clearance rejected`;
}

// ── Stat card 

type StatCardProps = {
  title: string;
  value: number | string;
  accent: string;   
  iconColor: string;
  icon: React.ElementType;
  loading: boolean;
};

function StatCard({ title, value, accent, iconColor, icon: Icon, loading }: StatCardProps) {
  const [borderColor, bgColor] = accent.split(" ");
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200 shadow-sm
        flex items-center gap-4 px-5 py-4
        border-l-4 ${borderColor}
        hover:shadow-md transition-shadow
      `}
    >
      <div className={`p-2.5 rounded-xl ${bgColor} shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        {loading ? (
          <>
            <div className="skeleton h-7 w-14 rounded mb-1.5" />
            <div className="skeleton h-3 w-24 rounded" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
            <p className="text-xs italic text-slate-400 mt-1 truncate">{title}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Quick actions 

const quickActions = [
  { label: "Register New Student",  href: "/registrar/register-student",          color: "bg-indigo-600 hover:bg-indigo-700" },
  { label: "Create User Account",   href: "/admin/create-user",                   color: "bg-emerald-600 hover:bg-emerald-700" },
  { label: "Add School",            href: "/admin/manage-faculty/add-school",     color: "bg-blue-600 hover:bg-blue-700" },
  { label: "Add Department",        href: "/admin/manage-faculty/add-department", color: "bg-purple-600 hover:bg-purple-700" },
];

// ── Main component 

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then((d) => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const statCards: Array<Omit<StatCardProps, "loading"> & { key: string }> = [
    {
      key: "students",
      title: "Registered Students",
      value: stats?.totalStudents ?? 0,
      accent: "border-emerald-400 bg-emerald-50",
      iconColor: "text-emerald-600",
      icon: GraduationCap,
    },
    {
      key: "pending",
      title: "Pending Clearances",
      value: stats?.pendingClearances ?? 0,
      accent: "border-amber-400 bg-amber-50",
      iconColor: "text-amber-600",
      icon: Clock3,
    },
    {
      key: "approved",
      title: "Approved Clearances",
      value: stats?.approvedClearances ?? 0,
      accent: "border-indigo-400 bg-indigo-50",
      iconColor: "text-indigo-600",
      icon: CheckCircle2,
    },
    {
      key: "departments",
      title: "Departments",
      value: stats?.totalDepartments ?? 0,
      accent: "border-orange-400 bg-orange-50",
      iconColor: "text-orange-600",
      icon: Building2,
    },
    {
      key: "schools",
      title: "Schools",
      value: stats?.totalSchools ?? 0,
      accent: "border-blue-400 bg-blue-50",
      iconColor: "text-blue-600",
      icon: School,
    },
    {
      key: "offices",
      title: "Clearance Offices",
      value: stats?.totalOffices ?? 0,
      accent: "border-pink-400 bg-pink-50",
      iconColor: "text-pink-600",
      icon: Briefcase,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map(({ key, ...cardProps }) => (
          <StatCard key={key} {...cardProps} loading={loading} />
        ))}
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent activity */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recent Clearance Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest approval actions across all offices</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="skeleton w-2 h-2 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 rounded w-2/3" />
                    <div className="skeleton h-3 rounded w-1/3" />
                  </div>
                  <div className="skeleton h-3 rounded w-16" />
                </div>
              ))
            ) : !stats?.recentActivity?.length ? (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">
                No clearance activity yet.
              </div>
            ) : (
              stats.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  {item.status === "APPROVED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {activityLabel(item)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.studentName}{" "}
                      <span className="font-mono text-slate-300">·</span>{" "}
                      {item.studentId}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                    {timeAgo(item.approvedAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Common admin tasks</p>
          </div>
          <div className="p-4 space-y-2.5">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-white transition-all ${a.color}`}
              >
                {a.label}
                <ArrowRight size={14} />
              </Link>
            ))}
          </div>

          <div className="mx-4 mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-emerald-700">All systems normal</p>
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">
              Clearance workflow, notifications and approvals are running smoothly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
