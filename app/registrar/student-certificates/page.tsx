"use client";

import { useEffect, useState } from "react";
import { fetchStudentCertificates } from "@/lib/api/student";

type Certificate = {
  id: string;
  fileUrl: string;
  fileName: string;
  issuedAt: string;
  student?: {
    firstName: string;
    lastName: string;
    studentId: string;
    department: {
      name: string;
    };
  };
  request?: {
    academicYear?: string;
    semester?: string;
    status?: string;
  };
};

export default function RegistrarCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentCertificates()
      .then((data) => setCertificates(Array.isArray(data) ? data : []))
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Clearance Certificates
        </h1>
        <p className="text-gray-500 mt-1">
          Manage and verify all issued student certificates
        </p>
      </div>

      {loading && (
        <div className="text-gray-500">Loading certificates...</div>
      )}
      {!loading && certificates.length === 0 && (
        <div className="text-center py-20 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No certificates found</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {cert.student?.firstName} {cert.student?.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  ID: {cert.student?.studentId}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                Issued
              </span>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Department:</span>{" "}
                {cert.student?.department?.name}
              </p>

              <p>
                <span className="font-medium">Academic Year:</span>{" "}
                {cert.request?.academicYear || "—"}
              </p>

              <p>
                <span className="font-medium">Semester:</span>{" "}
                {cert.request?.semester || "—"}
              </p>

              <p>
                <span className="font-medium">Issued:</span>{" "}
                {new Date(cert.issuedAt).toDateString()}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href={cert.fileUrl}
                target="_blank"
                className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                View Certificate
              </a>

              <a
                href={cert.fileUrl}
                download
                className="flex-1 text-center border py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}