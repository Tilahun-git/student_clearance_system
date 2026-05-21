"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download, Printer, ArrowLeft, CheckCircle2, Award } from "lucide-react";
import logo from "@/public/wldu_logo.jpg";
import { Certificate } from "@/types/clearance";
import { fetchStudentCertificates } from "@/lib/api/student";
import { DASHBOARD_CONTAINER_CLASS } from "@/components/layout/NoSidebarDashboardLayout";

export default function CertificatePage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentCertificates()
      .then((data) => setCertificates(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load certificates"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading your certificate…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-slate-700">Could not load certificate</p>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:bg-slate-700 transition"
        >
          <ArrowLeft size={14} />
          Go back
        </button>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Award className="w-7 h-7 text-amber-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700">No certificate available yet</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Your clearance certificate will appear here once all approval steps are completed and the registrar has issued it.
          </p>
        </div>
        <button
          onClick={() => router.push("/student/dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`${DASHBOARD_CONTAINER_CLASS} space-y-2`}>
      {certificates.map((cert) => {
        const student = cert.request?.student;
        const reasonName = typeof cert.request?.reason === "object"
          ? (cert.request.reason as any)?.name
          : cert.request?.reason || "—";

        return (
          <div
            key={cert.id}
            className="print-area bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="text-center border-b border-slate-100 pb-6">
                <div className="flex justify-center mb-3">
                  <img src={logo.src} className="w-16 h-16 object-contain" alt="University Logo" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Woldia University</h1>
                <h2 className="text-base font-semibold text-slate-700 mt-1">Student Clearance Certificate</h2>
                <p className="text-xs text-slate-400 mt-1">Official Academic Registrar Document</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["School", student?.school?.name],
                  ["Department", student?.department?.name],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{label}</p>
                    <p className="font-semibold text-slate-800 mt-1 text-sm">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Student Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-2.5 text-sm">
                  {[
                    ["Full Name", `${student?.firstName ?? ""} ${student?.middleName ?? ""} ${student?.lastName ?? ""}`.trim() || "—"],
                    ["Student ID", student?.studentId || "—"],
                    ["Program", student?.program || "—"],
                    ["Year", student?.year ? `Year ${student.year}` : "—"],
                    ["Section", student?.section || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-sm">
                {[
                  ["Academic Year", cert.request?.academicYear || "—"],
                  ["Semester", cert.request?.semester ? `Semester ${cert.request.semester}` : "—"],
                  ["Reason", reasonName],
                  ["Status", cert.request?.status || "APPROVED"],
                  ["Issued Date", new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-medium ${label === "Status" ? "text-emerald-600" : "text-slate-800"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <p className="text-xs text-slate-500">Registrar Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center">
                    <p className="text-[10px] text-slate-400 text-center leading-tight">Official<br />Stamp</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <p className="text-xs text-slate-500">Dean's Signature</p>
                </div>
              </div>

              <div className="w-full flex justify-end">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition"
                >
                  <Printer size={14} />
                  Print
                </button>
              </div>
            </div>
          
          </div>
        );
      })}
    </div>
  );
}
