"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assignAdvisorToStudents,fetchAdvisors,} from "@/lib/api/advisors";
import {fetchStudentsBySection,} from "@/lib/api/student";
import { Student } from "@/types/clearance";
import { Advisor } from "@/types/userData";
import StudentAdvisorTable from "./StudentAdvisorTable";
type Props = {section: string;};

export default function AssignAdvisorSection({section}: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [advisorId, setAdvisorId] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadData();
  }, [section]);
  async function loadData() {
    try {
      setLoading(true);
      const [studentData,advisorData,] = await Promise.all([
        fetchStudentsBySection(section),
        fetchAdvisors(),
      ]);
      setStudents(studentData || []);
      setAdvisors(advisorData || []);
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  }
  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter(
            (id) => id !== studentId
          )
        : [...prev, studentId]
    );
  }

  function toggleAll() {
    setSelectedStudents((prev) =>
      prev.length === students.length
        ? []
        : students.map((student) =>student.studentId));
          }
  async function assignAdvisor() {
    if (!advisorId) {
      return toast.error( "Select advisor");
     }
    if (!selectedStudents.length) {
      return toast.error("Select students");}
    try {
      setLoading(true);
      await assignAdvisorToStudents(selectedStudents,advisorId);
      toast.success("Advisor assigned");
      await loadData();
      setSelectedStudents([]);
    } catch (error) {
      console.error(error);
      toast.error("Assignment failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Section {section}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Assign advisors to students
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={advisorId}
              onChange={(e) =>
              setAdvisorId(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">
                Select Advisor
              </option>
              {advisors.map(
                (advisor) => (
                  <option
                    key={advisor.id}
                    value={advisor.id}>
                    {advisor.user?.name}
                  </option>
                )
              )}
            </select>
            <button
              onClick={assignAdvisor}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition">
              {loading? "Processing...": "Assign Advisor"}
            </button>
          </div>
        </div>
      </div>
      <StudentAdvisorTable
        students={students}
        selectedStudents={selectedStudents}
        onToggleStudent={toggleStudent}
        onToggleAll={toggleAll}
      />
    </div>
  );
}