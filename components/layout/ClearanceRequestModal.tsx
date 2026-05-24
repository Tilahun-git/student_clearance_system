"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchClearanceProgress, fetchStudentProfile, submitClearanceRequest } from "@/lib/api/student";
import { Reasons } from "@/lib/constants/reasons";
import { getEthiopianAcademicContext } from "@/lib/clearance/academicCalendar";
import { X } from "lucide-react";

const DEFAULT_CONTEXT = getEthiopianAcademicContext();

export default function ClearanceRequestModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    reason: "",
    academicYear: DEFAULT_CONTEXT.academicYear,
    semester: DEFAULT_CONTEXT.semester,
  });

  useEffect(() => {
    Promise.all([fetchStudentProfile(), fetchClearanceProgress()])
      .then(([profile, progress]) => {
        setStudent(profile);
        setForm((current) => ({
          ...current,
          reason: progress.previousReason ?? current.reason,
        }));
      })
      .catch(() => toast.error("Failed to load student info"))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reason)       return toast.error("Please select a reason");
    if (!form.academicYear) return toast.error("Please select an academic year");
    if (!form.semester)     return toast.error("Please select a semester");
    setSubmitting(true);
    try {
      await submitClearanceRequest(form);
      toast.success("Request submitted successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm modal-backdrop px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden modal-panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Clearance Request</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in your details to request clearance</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <section>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Student Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={student?.studentId ?? ""} readOnly className="input" placeholder="Student ID" />
                  <input value={student?.firstName ?? ""}  readOnly className="input" placeholder="First Name" />
                  <input value={student?.middleName ?? ""} readOnly className="input" placeholder="Middle Name" />
                  <input value={student?.lastName ?? ""}   readOnly className="input" placeholder="Last Name" />
                </div>
              </section>
              <section>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Academic Placement
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={student?.school?.name     ?? "—"} readOnly className="input" placeholder="School" />
                  <input value={student?.department?.name ?? "—"} readOnly className="input" placeholder="Department" />
                </div>
              </section>
              <section>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Request Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select name="reason" value={form.reason} onChange={handleChange} className="input" required>
                    <option value="">Select Reason</option>
                    {Reasons.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <select name="academicYear" value={form.academicYear} className="input" disabled required>
                    <option value={form.academicYear}>{form.academicYear}</option>
                  </select>
                  <select
                    name="semester"
                    value={form.semester}
                    className="input"
                    disabled
                    required
                  >
                    <option value={form.semester}>{form.semester === "1st" ? "First Semester" : "Second Semester"}</option>
                  </select>
                </div>
              </section>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {submitting && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {submitting ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
