"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Header from "@/components/layout/Header";
import { DASHBOARD_CONTAINER_CLASS } from "@/components/layout/NoSidebarDashboardLayout";
import ClearanceRequestModal from "@/components/layout/ClearanceRequestModal";
import ClearanceTable from "@/components/tables/ClearanceProgressTable";
import { FileCheck2, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  ApiFetchError,
  fetchClearanceProgress,
  type ClearanceApprovalRow,
  type ClearanceProgressData,
} from "@/lib/api/student";
import { useClearanceSync } from "@/contexts/ClearanceRealtimeContext";

export default function StudentDashboard() {
  const router = useRouter();
  const { status } = useSession();
  const [openRequest, setOpenRequest] = useState(false);
  const [data, setData] = useState<ClearanceApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canRequest, setCanRequest] = useState(false);
  const [headerData, setHeaderData] = useState<ClearanceProgressData | null>(null);

  const hasRequest = data.length > 0;
  const hasRejected = data.some((item) => item.status === "REJECTED");
  const isFullyApproved = hasRequest && data.every((item) => item.status === "APPROVED");
  const isInProgress = hasRequest && !isFullyApproved && !hasRejected;

  const applyProgress = useCallback((responseData: ClearanceProgressData) => {
    setData(responseData.approvals || []);
    setCanRequest(responseData.canRequest);
    setHeaderData(responseData);
  }, []);

  const loadProgress = useCallback(
    async (silent = false) => {
      try {
        if (silent) setRefreshing(true);
        else setLoading(true);

        const responseData = await fetchClearanceProgress();
        applyProgress(responseData);
      } catch (error) {
        if (error instanceof ApiFetchError && error.status === 401) {
          toast.error("Your session has expired. Please sign in again.");
          router.replace("/auth/login");
          return;
        }

        console.error("Failed to load progress:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyProgress, router],
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    loadProgress(false);
  }, [status, loadProgress]);

  useClearanceSync(() => loadProgress(true), {
    enabled: status === "authenticated",
  });

  return (
    <>
      <Header progressData={headerData} progressLoading={loading && !headerData} />
      <div className={`${DASHBOARD_CONTAINER_CLASS} pb-6 space-y-5 -mt-1`}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Approval Stages</h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Status for each office in your clearance chain</span>
                {refreshing && (
                  <span className="text-indigo-500 inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    Syncing…
                  </span>
                )}
              </p>
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

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              if (canRequest) setOpenRequest(true);
            }}
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
            onSuccess={async () => {
              setOpenRequest(false);
              await loadProgress(true);
            }}
          />
        )}
      </div>
    </>
  );
}
