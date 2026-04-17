import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Header from "@/components/layout/Header";
import DowloadSection from "@/components/layout/DowloadSection";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">

      <DashBoardNavbar />
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">
                Clearance Request
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                Start your clearance process. Your request will be reviewed by
                departments, advisors, and university offices in a structured approval flow.
              </p>
            </div>

            <Link
              href="/student/clearance/request"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition"
            >
              Start Clearance
            </Link>

          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition p-6">

            <h3 className="text-lg font-semibold text-slate-900">
              Clearance Status
            </h3>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Track approval progress and view feedback from departments.
            </p>

            <Link
              href="/student/clearance/status"
              className="mt-5 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              View Status →
            </Link>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition p-6">

            <h3 className="text-lg font-semibold text-slate-900">
              Documents
            </h3>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Download clearance forms, receipts, and official documents.
            </p>

            <div className="mt-5">
              <DowloadSection />
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}