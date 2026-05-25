"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { assignAdvisorToStudents, fetchAdvisors } from "@/lib/api/advisors";
import { fetchStudentsBySection } from "@/lib/api/student";
import { Student } from "@/types/clearance";
import { Advisor } from "@/types/userData";
import StudentAdvisorTable from "@/components/tables/StudentAdvisorTable";
import { Users, CheckCheck, RefreshCw, X } from "lucide-react";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";

const PAGE_SIZE = 10;

type Props = { section: string };

export default function AssignAdvisorSection({ section }: Props) {
  const [students, setStudents]               = useState<Student[]>([]);
  const [advisors, setAdvisors]               = useState<Advisor[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [advisorId, setAdvisorId]             = useState("");
  const [loading, setLoading]                 = useState(false);
  const [assigning, setAssigning]             = useState(false);
  const [reassignTarget, setReassignTarget]   = useState<Student | null>(null);
  const [reassignAdvisorId, setReassignAdvisorId] = useState("");
  const [reassigning, setReassigning]         = useState(false);

  useEffect(() => {
    loadData();
  }, [section]);

  async function loadData() {
    try {
      setLoading(true);
      setSelectedStudents([]);
      setAdvisorId("");
      const [studentData, advisorData] = await Promise.all([
        fetchStudentsBySection(section),
        fetchAdvisors(),
      ]);
      setStudents(studentData || []);
      setAdvisors(advisorData || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function toggleStudent(studentId: string) {
    const student = students.find((s) => s.studentId === studentId);
    if (student?.advisorId) return; 
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  }

  function toggleAll() {
    const unassigned = students.filter((s) => !s.advisorId).map((s) => s.studentId);
    const allSelected = unassigned.every((id) => selectedStudents.includes(id));
    setSelectedStudents(allSelected ? [] : unassigned);
  }

  function clearSelection() {
    setSelectedStudents([]);
  }
  async function assignAdvisor() {
    if (!advisorId)            return toast.error("Please select an advisor first");
    if (!selectedStudents.length) return toast.error("Please select at least one student");

    try {
      setAssigning(true);
      await assignAdvisorToStudents(selectedStudents, advisorId);
      toast.success(`Advisor assigned to ${selectedStudents.length} student(s)`);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Assignment failed");
    } finally {
      setAssigning(false);
    }
  }

  // ── Reassign (single student) ─────────────────────────────────────────────
  function openReassign(student: Student) {
    setReassignTarget(student);
    // Pre-select current advisor so the user sees what's already set
    setReassignAdvisorId(student.advisorId ?? "");
  }

  function closeReassign() {
    setReassignTarget(null);
    setReassignAdvisorId("");
  }

  async function confirmReassign() {
    if (!reassignTarget)      return;
    if (!reassignAdvisorId)   return toast.error("Please select a new advisor");
    if (reassignAdvisorId === reassignTarget.advisorId)
      return toast.error("That is already the current advisor");

    try {
      setReassigning(true);
      await assignAdvisorToStudents([reassignTarget.studentId], reassignAdvisorId);
      toast.success(`Advisor reassigned for ${reassignTarget.firstName} ${reassignTarget.lastName}`);
      closeReassign();
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Reassignment failed");
    } finally {
      setReassigning(false);
    }
  }
  const someSelected    = selectedStudents.length > 0;
  const unassignedCount = students.filter((s) => !s.advisorId).length;
  const { page, totalPages, totalItems, paged, goTo } = usePagination(students, PAGE_SIZE);
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Section {section} — Advisor Assignment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {students.length} students · {unassignedCount} unassigned
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {unassignedCount > 0 && (
              <button
                onClick={toggleAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <CheckCheck size={13} />
                {selectedStudents.length === unassignedCount ? "Clear All" : "Select Unassigned"}
              </button>
            )}
            <select
              value={advisorId}
              onChange={(e) => setAdvisorId(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-w-[160px]"
            >
              <option value="">Select Advisor</option>
              {advisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.user?.name}
                </option>
              ))}
            </select>
            <button
              onClick={assignAdvisor}
              disabled={assigning || !someSelected || !advisorId}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning
                ? "Assigning…"
                : someSelected
                ? `Assign to ${selectedStudents.length}`
                : "Assign"}
            </button>
          </div>
        </div>
        {someSelected && (
          <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
            <CheckCheck size={12} />
            <span>
              <strong>{selectedStudents.length}</strong> student
              {selectedStudents.length > 1 ? "s" : ""} selected
              {advisorId
                ? ` · will be assigned to ${advisors.find((a) => a.id === advisorId)?.user?.name ?? "selected advisor"}`
                : " · select an advisor to assign"}
            </span>
            <button
              onClick={clearSelection}
              className="ml-auto text-indigo-500 hover:text-indigo-700 font-medium"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <StudentAdvisorTable
            students={paged}
            selectedStudents={selectedStudents}
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

      {reassignTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeReassign()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
              <div className="h-1.5 w-full bg-amber-400" />

              <div className="flex items-start justify-between px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100">
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Reassign Advisor</h2>
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
              <div className="px-5 pb-5 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-500">Current advisor: </span>
                  <span className="font-semibold text-slate-700">
                    {reassignTarget.advisor?.user?.name ?? "—"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">New Advisor</label>
                  <select
                    value={reassignAdvisorId}
                    onChange={(e) => setReassignAdvisorId(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  >
                    <option value="">Select new advisor…</option>
                    {advisors.map((advisor) => (
                      <option
                        key={advisor.id}
                        value={advisor.id}
                        disabled={advisor.id === reassignTarget.advisorId}
                      >
                        {advisor.user?.name}
                        {advisor.id === reassignTarget.advisorId ? " (current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={closeReassign}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReassign}
                    disabled={reassigning || !reassignAdvisorId || reassignAdvisorId === reassignTarget.advisorId}
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
