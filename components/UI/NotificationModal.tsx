"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function NotificationModal({
  notificationId,
  onClose,
}: {
  notificationId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/notifications/details?id=${notificationId}`);
        const result = await res.json();
        setData(result);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [notificationId]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const isRejection = data?.extraData?.comment;
  const isApproved = data?.notification?.message?.toLowerCase().includes("approved");

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Colored top bar */}
        <div className={`h-1.5 w-full ${isRejection ? "bg-red-500" : "bg-indigo-500"}`} />

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isRejection ? "bg-red-100" : "bg-indigo-100"}`}>
              {isRejection ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Bell className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {isRejection ? "Request Rejected" : "Notification"}
              </h2>
              {data?.notification?.createdAt && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(data.notification.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Message */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {data?.notification?.message}
                </p>
              </div>

              {/* Rejection reason */}
              {isRejection && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-semibold text-red-700">Rejection Reason</p>
                  </div>
                  <p className="text-sm text-red-600 leading-relaxed">
                    {data.extraData.comment}
                  </p>
                </div>
              )}

              {/* Approved indicator */}
              {isApproved && !isRejection && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-700 font-medium">
                    This step has been approved successfully.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
