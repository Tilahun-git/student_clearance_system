"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Users, CheckCheck, RefreshCw, X, Search } from "lucide-react";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";
import StudentProctorTable, { StudentRow } from "@/components/tables/StudentProctorTable";

const PAGE_SIZE = 15;

// ── Types ─────────────────────────────────────────────────────────────────────
type ProctorOption = {
  id: string;
  firstName: string;
  lastName: string;
  blockNumber: number | null;
};

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchProctors(): Promise<ProctorOption[]> {
  const res  = await fetch("/api/super-proctor/proctors");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to fetch proctors");
  return data.data;
}

async function fetchAllStudents(): Promise<StudentRow[]> {
  const res  = await fetch("/api/super-proctor/students");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to fetch students");
  return data.data;
}

async function assignProctorApi(studentIds: string[], proctorId: string) {
  const res = await fetch("/api/super-proctor/assign", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ studentIds, proctorId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Assignment failed");
  return data;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AssignProctorSection() {
  const [students, setStudents]   = useState<StudentRow[]>([]);
  const [proctors, setProctors]   = useState<ProctorOption[]>([]);
  const [selected, setSelected]   = useState<string[]>([]);
  const [proctorId, setProctorId] = useState("");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Reassign modal
  const [reassignTarget, setReassignTarget]       = useState<StudentRow | null>(null);
  const [reassignProctorId, setReassignProctorId] = useState("");
  const [reassigning, setReassigning]             = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      setSelected([]);
      setProctorId("");
      const [s, p] = await Promise.all([fetchAllStudents(), fetchProctors()]);
      setStudents(s);
      setProctors(p);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.studentId.toLowerCase().includes(q) ||
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q)
    );
  });

  const { page, totalPages, totalItems, paged, goTo } = usePagination(filtered, PAGE_SIZE);

  // ── Selection (only unassigned students) ──────────────────────────────────
  const unassigned = filtered.filter((s) => !s.proctorId);

  function toggleStudent(studentId: string) {
    const s = students.find((x) => x.studentId === studentId);
    if (s?.proctorId) return; // guard: already assigned
    setSelected((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  }

  function toggleAll() {
    const ids     = unassigned.map((s) => s.studentId);
    const allSel  = ids.every((id) => selected.includes(id));
    setSelected(allSel ? [] : ids);
  }

  // ── Bulk assign ────────────────────────────────────────────────────────────
  async function handleAssign() {
    if (!proctorId)      return toast.error("Select a proctor first");
    if (!selected.length) return toast.error("Select at least one student");
    try {
      setAssigning(true);
      await assignProctorApi(selected, proctorId);
      toast.success(`Proctor assigned to ${selected.length} student(s)`);
      await loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAssigning(false);
    }
  }

  // ── Reassign ───────────────────────────────────────────────────────────────
  function openReassign(s: StudentRow) {
    setReassignTarget(s);
    setReassignProctorId(s.proctorId ?? "");
  }

  function closeReassign() {
    setReassignTarget(null);
    setReassignProctorId("");
  }

  async function confirmReassign() {
    if (!reassignTarget)    return;
    if (!reassignProctorId) return toast.error("Select a new proctor");
    if (reassignProctorId === reassignTarget.proctorId)
      return toast.error("That is already the current proctor");
    try {
      setReassigning(true);
      await assignProctorApi([reassignTarget.studentId], reassignProctorId);
      toast.success(
        `Proctor reassigned for ${reassignTarget.firstName} ${reassignTarget.lastName}`,
      );
      closeReassign();
      await loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setReassigning(false);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const someSelected    = selected.length > 0;
  const unassignedCount = students.filter((s) => !s.proctorId).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-100">
              <Users className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Proctor Assignment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {students.length} students · {unassignedCount} unassigned
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search students…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); goTo(1); }}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 transition w-44"
              />
            </div>

            {/* Select unassigned */}
            {unassignedCount > 0 && (
              <button
                onClick={toggleAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <CheckCheck size={13} />
                {unassigned.every((s) => selected.includes(s.studentId))
                  ? "Clear All"
                  : "Select Unassigned"}
              </button>
            )}

            {/* Proctor dropdown */}
            <select
              value={proctorId}
              onChange={(e) => setProctorId(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 transition min-w-[160px]"
            >
              <option value="">Select Proctor</option>
              {proctors.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                  {p.blockNumber != null ? ` — Block ${p.blockNumber}` : ""}
                </option>
              ))}
            </select>

            {/* Assign button */}
            <button
              onClick={handleAssign}
              disabled={assigning || !someSelected || !proctorId}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning
                ? "Assigning…"
                : someSelected
                ? `Assign to ${selected.length}`
                : "Assign"}
            </button>
          </div>
        </div>

        {/* Selection summary bar */}
        {someSelected && (
          <div className="mt-3 flex items-center gap-2 text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
            <CheckCheck size={12} />
            <span>
              <strong>{selected.length}</strong> student
              {selected.length > 1 ? "s" : ""} selected
              {proctorId
                ? ` · will be assigned to ${
                    proctors.find((p) => p.id === proctorId)?.firstName ?? "selected proctor"
                  }`
                : " · select a proctor to assign"}
            </span>
            <button
              onClick={() => setSelected([])}
              className="ml-auto text-violet-500 hover:text-violet-700 font-medium"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <StudentProctorTable
            students={paged}
            selectedStudents={selected}
            onToggleStudent={toggleStudent}
            onToggleAll={toggleAll}
            onReassign={openReassign}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={goTo}
          />
        </>
      )}

      {/* ── Reassign modal (portal) ──────────────────────────────────────── */}
      {reassignTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeReassign()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
              <div className="h-1.5 w-full bg-amber-400" />

              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100">
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Reassign Proctor
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {reassignTarget.firstName} {reassignTarget.lastName} ·{" "}
                      {reassignTarget.studentId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeReassign}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 pb-5 space-y-4">
                {/* Current proctor */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-500">Current proctor: </span>
                  <span className="font-semibold text-slate-700">
                    {reassignTarget.proctor
                      ? `${reassignTarget.proctor.firstName} ${reassignTarget.proctor.lastName}`
                      : "—"}
                  </span>
                </div>

                {/* New proctor selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    New Proctor
                  </label>
                  <select
                    value={reassignProctorId}
                    onChange={(e) => setReassignProctorId(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  >
                    <option value="">Select new proctor…</option>
                    {proctors.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.id === reassignTarget.proctorId}
                      >
                        {p.firstName} {p.lastName}
                        {p.blockNumber != null ? ` — Block ${p.blockNumber}` : ""}
                        {p.id === reassignTarget.proctorId ? " (current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={closeReassign}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReassign}
                    disabled={
                      reassigning ||
                      !reassignProctorId ||
                      reassignProctorId === reassignTarget.proctorId
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={13} />
                    {reassigning ? "Reassigning…" : "Confirm Reassign"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
