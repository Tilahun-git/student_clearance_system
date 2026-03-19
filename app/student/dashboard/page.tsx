"use client";

import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Header from "@/components/layout/Header";
import DowloadSection from "@/components/layout/DowloadSection";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <DashBoardNavbar />

      {/* Header */}
      <Header />

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Request Clearance
            </h2>

            <p className="text-gray-500 mt-2">
              Start your clearance process by submitting a clearance request.
              You will select your faculty, school, and department, and your request
              will be reviewed by advisors and relevant university offices.
            </p>
          </div>

          <Link
            href="/student/clearance/request"
            className="mt-4 bg-gray-500 hover:bg-slate-400 text-black px-5 py-2 rounded-lg text-center"
          >
            Start Clearance Request
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Clearance Status
          </h2>

          <p className="text-gray-500 mt-2">
            Track the progress of your clearance approvals. You can see which offices have
            approved or rejected your request, and any comments provided.
          </p>

          {/* <Link
            href="/student/clearance/status"
            className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
          >
            View Status
          </Link> */}
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-6 pb-10">
        <DowloadSection />
      </div>

    </div>
  );
}