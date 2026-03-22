import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Header from "@/components/layout/Header";
import DowloadSection from "@/components/layout/DowloadSection";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">

      <DashBoardNavbar />
      <Header />

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-8">

        {/* CARD 1 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition">

          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Request Clearance
            </h2>

            <p className="text-slate-600 mt-3 leading-relaxed">
              Start your clearance process by submitting a clearance request.
              You will select your faculty, school, and department, and your request
              will be reviewed by advisors and relevant university offices.
            </p>
          </div>

          <Link
            href="/student/clearance/request"
            className="mt-6 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
          >
            Start Clearance Request
          </Link>

        </div>

        {/* CARD 2 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition">

          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Clearance Status
            </h2>

            <p className="text-slate-600 mt-3 leading-relaxed">
              Track the progress of your clearance approvals. You can see which offices have
              approved or rejected your request, and any comments provided.
            </p>
          </div>

          {/* You can enable later */}
          {/* 
          <Link
            href="/student/clearance/status"
            className="mt-6 inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
          >
            View Status
          </Link>
          */}

        </div>

      </div>

      {/* DOWNLOAD SECTION */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <DowloadSection />
      </div>

    </div>
  );
}