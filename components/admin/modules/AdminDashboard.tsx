"use client";

import {
  Users,
  GraduationCap,
  Building2,
  School,
  Briefcase,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Registered Students",
    value: "842",
    icon: GraduationCap,
    color:
      "bg-emerald-100 text-emerald-700",
  },

  {
    title: "Pending Clearances",
    value: "56",
    icon: Clock3,
    color:
      "bg-amber-100 text-amber-700",
  },

  {
    title: "Approved Clearances",
    value: "721",
    icon: CheckCircle2,
    color:
      "bg-indigo-100 text-indigo-700",
  },

  {
    title: "Departments",
    value: "12",
    icon: Building2,
    color:
      "bg-orange-100 text-orange-700",
  },

  {
    title: "Schools",
    value: "5",
    icon: School,
    color:
      "bg-blue-100 text-blue-700",
  },

  {
    title: "Clearance Offices",
    value: "8",
    icon: Briefcase,
    color:
      "bg-pink-100 text-pink-700",
  },
];

const recentActivities = [
  {
    student: "WDU23001",
    action:
      "Library clearance approved",
    time: "2 mins ago",
  },

  {
    student: "WDU23012",
    action:
      "Department clearance pending",
    time: "10 mins ago",
  },

  {
    student: "WDU23018",
    action:
      "Finance office approved clearance",
    time: "25 mins ago",
  },

  {
    student: "WDU23025",
    action:
      "Advisor assigned successfully",
    time: "1 hour ago",
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            Student Clearance Dashboard
          </h2>

          <p className="text-slate-500 mt-2">
            Monitor student clearance
            progress, approvals,
            departments and office
            activities across the
            university.
          </p>
        </div>

        <div
          className="
            hidden md:flex
            items-center gap-3
            bg-indigo-50
            text-indigo-700
            px-5 py-3
            rounded-2xl
            border border-indigo-100
          "
        >
          <ClipboardCheck size={22} />

          <div>
            <p className="text-sm font-medium">
              Clearance System
            </p>

            <p className="text-xs text-indigo-500">
              Active & Operational
            </p>
          </div>
        </div>

      </div>

      {/* STATS */}

      <div
        className="
          grid grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        {stats.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                bg-white
                border border-slate-200
                rounded-3xl
                p-6
                shadow-sm
                hover:shadow-md
                transition-all
              "
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>

                  <h3 className="text-4xl font-bold text-slate-800 mt-3">
                    {item.value}
                  </h3>
                </div>

                <div
                  className={`
                    h-16 w-16
                    rounded-2xl
                    flex items-center justify-center
                    ${item.color}
                  `}
                >
                  <Icon size={30} />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID */}

      <div
        className="
          grid grid-cols-1
          xl:grid-cols-3
          gap-6
        "
      >

        {/* RECENT ACTIVITIES */}

        <div
          className="
            xl:col-span-2
            bg-white
            border border-slate-200
            rounded-3xl
            p-6
            shadow-sm
          "
        >
          <div className="flex items-center justify-between mb-6">

            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Recent Clearance Activities
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Latest updates from
                offices and departments
              </p>
            </div>

          </div>

          <div className="space-y-4">

            {recentActivities.map(
              (activity, index) => (
                <div
                  key={index}
                  className="
                    flex items-center justify-between
                    border border-slate-100
                    rounded-2xl
                    p-4
                    hover:bg-slate-50
                    transition
                  "
                >
                  <div>
                    <p className="font-semibold text-slate-700">
                      {
                        activity.student
                      }
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {
                        activity.action
                      }
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    {activity.time}
                  </span>
                </div>
              )
            )}

          </div>
        </div>


        <div
          className="
            bg-linear-to-br
            from-indigo-600
            to-indigo-500
            rounded-3xl
            p-6
            text-white
            shadow-lg
          "
        >
          <h3 className="text-2xl font-bold">
            Quick Actions
          </h3>

          <p className="text-indigo-100 mt-2">
            Manage student clearance
            operations quickly from one
            place.
          </p>

          <div className="mt-6 space-y-3">

            <button
              className="
                w-full
                bg-white/10
                hover:bg-white/20
                transition
                rounded-2xl
                p-4
                text-left
              "
            >
              Register New Student
            </button>

            <button
              className="
                w-full
                bg-white/10
                hover:bg-white/20
                transition
                rounded-2xl
                p-4
                text-left
              "
            >
              Assign Advisors
            </button>

            <button
              className="
                w-full
                bg-white/10
                hover:bg-white/20
                transition
                rounded-2xl
                p-4
                text-left
              "
            >
              Review Pending Clearances
            </button>

            <button
              className="
                w-full
                bg-white/10
                hover:bg-white/20
                transition
                rounded-2xl
                p-4
                text-left
              "
            >
              Generate Clearance Reports
            </button>

          </div>
        </div>

      </div>

      {/* FOOTER STATUS */}

      <div
        className="
          bg-white
          border border-slate-200
          rounded-3xl
          p-6
          shadow-sm
        "
      >
        <div className="flex items-center gap-4">

          <div
            className="
              h-14 w-14
              rounded-2xl
              bg-emerald-100
              text-emerald-700
              flex items-center justify-center
            "
          >
            <ClipboardCheck size={28} />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-800">
              Clearance Workflow Status
            </h4>

            <p className="text-slate-500 mt-1">
              All clearance modules,
              office approvals,
              advisor assignments and
              department operations are
              functioning normally.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}