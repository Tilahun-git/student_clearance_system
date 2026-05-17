"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ClearanceRequestModal from "@/components/layout/ClearanceRequestModal";
import ClearanceTable from "@/components/UI/ClearanceProgressTable";
import { FileCheck2, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { fetchClearanceProgress } from "@/lib/api/student";

export default function StudentDashboard() {
  const router = useRouter();
  const [openRequest, setOpenRequest] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canRequest, setCanRequest] = useState(false);

  const hasRequest      = data.length > 0;
  const hasRejected     = data.some((item) => item.status === "REJECTED");
  const isFullyApproved = hasRequest && data.every((item) => item.status === "APPROVED");
  const isInProgress    = hasRequest && !isFullyApproved && !hasRejected;

  const loadProgress = async () => {
    try {
      setLoading(true);
      const responseData = await fetchClearanceProgress();
      setData(responseData.approvals || []);
      setCanRequest(responseData.canRequest);
    } catch (error) {
      console.error("Failed to load progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProgress(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-5 py-6 space-y-6">
      <Header />
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-800">Clearance Progress</h2>
          </div>
          <button
            onClick={() => isFullyApproved && router.push("/student/clearance/certificate")}
            disabled={!isFullyApproved}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              isFullyApproved
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <FileCheck2 size={15} />
            {isFullyApproved ? "View Certificate" : "Certificate Not Ready"}
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !hasRequest ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FileCheck2 className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No clearance request yet</p>
            <p className="text-xs text-slate-400 mt-1">Submit a request to start the clearance process.</p>
          </div>
        ) : (
          <ClearanceTable data={data} />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => { if (canRequest) setOpenRequest(true); }}
          disabled={!canRequest}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition shadow-sm w-fit ${
            canRequest
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isFullyApproved ? <CheckCircle2 size={16} /> : <Send size={15} />}
          {!hasRequest
            ? "Submit Clearance Request"
            : isInProgress
            ? "Request In Progress"
            : isFullyApproved
            ? "Start New Clearance"
            : hasRejected
            ? "Resubmit Clearance Request"
            : "Submit Clearance Request"}
        </button>

        {hasRejected && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl w-fit">
            <AlertCircle size={15} />
            Your previous request was rejected. Review the reason and resubmit your clearance request.
          </div>
        )}

        {isFullyApproved && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl w-fit">
            <CheckCircle2 size={15} />
            Your clearance has been fully approved. You may now download your certificate or start a new clearance request.
          </div>
        )}
      </div>

      {openRequest && (
        <ClearanceRequestModal
          onClose={() => setOpenRequest(false)}
          onSuccess={() => { setOpenRequest(false); loadProgress(); }}
        />
      )}
    </div>
  );
}
