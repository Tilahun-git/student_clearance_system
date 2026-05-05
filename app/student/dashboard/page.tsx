"use client";

import { useEffect, useState } from "react";
import ClearanceRequestModal from "@/components/layout/ClearanceRequestModal";
import ClearanceTable from "@/components/UI/ClearanceProgressTable";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();

  const [openRequest, setOpenRequest] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canRequest, setCanRequest] = useState(false);

  const hasRejected = data?.some((d) => d.status === "REJECTED");

  const isFullyApproved =
    data.length > 0 && data.every((d) => d.status === "APPROVED");

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/student/clearance-progress");
      const responseData = await res.json();

      setData(responseData.approvals || []);
      setCanRequest(responseData.canRequest);
    } catch {
      console.error("Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div className="w-full space-y-8 bg-slate-100">
      
      <section className="bg-white rounded-2xl shadow-sm border">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-semibold text-indigo-600">
            Clearance Progress
          </h2>

          <button
            onClick={() => {
              if (isFullyApproved) {
                router.push("/student/certificate");
              }
            }}
            disabled={!isFullyApproved}
            className={`px-5 py-2 rounded-full text-sm transition
              ${
                isFullyApproved
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            Download
          </button>
        </div>

        {loading ? (
          <p className="p-6 text-slate-500">Loading...</p>
        ) : data.length === 0 ? (
          <p className="p-6 text-slate-500 text-center">
            You haven't started clearance request yet.
          </p>
        ) : (
          <ClearanceTable data={data} />
        )}
      </section>
      <section className="flex flex-col items-start gap-2">
        <button
          onClick={() => canRequest && setOpenRequest(true)}
          disabled={!canRequest}
          className={`px-8 py-3 rounded-xl font-medium transition shadow-sm
            ${
              canRequest
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {canRequest ? "Submit Clearance Request" : "Request In Progress"}
        </button>

        {canRequest && hasRejected && (
          <p className="text-sm text-red-500">
            Your previous request was rejected. Fix issues and reapply.
          </p>
        )}
      </section>

      {openRequest && (
        <ClearanceRequestModal
          onClose={() => setOpenRequest(false)}
          onSuccess={() => {
            setOpenRequest(false);

            fetchProgress();
          }}
        />
      )}
    </div>
  );
}