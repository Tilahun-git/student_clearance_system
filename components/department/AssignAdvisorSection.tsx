"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assignAdvisorToStudents, fetchAdvisors } from "@/lib/api/advisors";
import { fetchStudentsBySection } from "@/lib/api/student";
import { Student } from "@/types/clearance";
import { Advisor } from "@/types/userData";
import StudentAdvisorTable from "@/components/tables/StudentAdvisorTable";
import { Users, CheckCheck, UserCheck } from "lucide-react";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";

const PAGE_SIZE = 10;

type Props = { section: string };

export default function AssignAdvisorSection({ section }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [advisorId, setAdvisorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

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
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  }

  function selectAll() {
    setSelectedStudents(students.map((s) => s.studentId));
  }

  function clearSelection() {
    setSelectedStudents([]);
  }

  function toggleAll() {
    if (selectedStudents.length === students.length) {
      clearSelection();
    } else {
      selectAll();
    }
  }

  async function assignAdvisor() {
    if (!advisorId) return toast.error("Please select an advisor first");
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

  const allSelected = students.length > 0 && selectedStudents.length === students.length;
  const someSelected = selectedStudents.length > 0;
  const unassignedCount = students.filter((s) => !s.advisorId).length;

  const { page, totalPages, totalItems, paged, goTo } = usePagination(students, PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title */}
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

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Select All / Clear */}
            {students.length > 0 && (
              <button
                onClick={toggleAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <CheckCheck size={13} />
                {allSelected ? "Clear All" : "Select All"}
              </button>
            )}

            {/* Advisor selector */}
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

            {/* Assign button */}
            <button
              onClick={assignAdvisor}
              disabled={assigning || !someSelected || !advisorId}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* <UserCheck size={14} /> */}
              {assigning
                ? "Assigning…"
                : someSelected
                ? `Assign to ${selectedStudents.length}`
                : "Assign"}
            </button>
          </div>
        </div>

        {/* Selection summary bar */}
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

      {/* Student table */}
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
    </div>
  );
}
