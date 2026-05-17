"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open (safer default)
  useEffect(() => {
    if (open) setTimeout(() => cancelRef.current?.focus(), 50);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Red top bar */}
        <div className="h-1.5 w-full bg-red-500" />

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">{title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Warning note */}
        <div className="mx-5 mb-5 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-700">
            This action <span className="font-semibold">cannot be undone</span>. Please confirm you want to proceed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
