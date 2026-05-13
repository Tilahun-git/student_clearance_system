"use client";

import { useEffect, useState } from "react";
import {FileText } from "lucide-react";
import logo from "@/public/wldu_logo.jpg";
import { Certificate } from "@/types/clearance";



export default function CertificatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCertificates() {
      const res = await fetch("/api/student/clearance/certificates");
      const data = await res.json();
      setCertificates(Array.isArray(data) ? data : []);
      setLoading(false);
    }

    loadCertificates();
  }, []);

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 animate-pulse">
          Loading certificates...
        </p>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {certificates.map((cert) => {
          const student = cert.request?.student;

          return (
            <div key={cert.id}
              className="print-area relative bg-white rounded-2xl border border-slate-200 shadow-md p-10">
              <div className="text-center border-b pb-6 mb-6">
                <div className="flex justify-center mb-3">
                  <img
                    src={logo.src}
                    className="w-16 h-16 object-contain"
                    alt="logo"
                  />
                </div>

                <h1 className="text-xl font-bold text-slate-900">
                  University Clearance Certificate
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Official Academic Registrar Document
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  ["Faculty", student?.faculty?.name],
                  ["School", student?.school?.name],
                  ["Department", student?.department?.name],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center"
                  >
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                  <FileText size={16} />
                  Student Information
                </h3>

                <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-700">
                  <p><span className="text-slate-500">Name:</span> {student?.firstName} {student?.lastName}</p>
                  <p><span className="text-slate-500">Student ID:</span> {student?.studentId}</p>
                  <p><span className="text-slate-500">Program:</span> {student?.program || "—"}</p>
                  <p><span className="text-slate-500">Year:</span> {student?.year || "—"}</p>
                  <p><span className="text-slate-500">Section:</span> {student?.section || "—"}</p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Academic Year</span>
                  <span className="font-medium">{cert.request?.academicYear || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Semester</span>
                  <span className="font-medium">{cert.request?.semester || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Reason</span>
                  <span className="font-medium">{cert.request?.reason.name || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-600">
                    {cert.request?.status || "APPROVED"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Issued Date</span>
                  <span className="font-medium">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-10 flex justify-between text-xs text-slate-400">
                <span>Registrar Signature</span>
                <span>Official Stamp</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}