"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { fetchStudentProfile } from "@/lib/api/student";
import { Reasons } from "@/lib/constants/reasons";
import { MdClose } from "react-icons/md";

export default function ClearanceRequestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [form, setForm] = useState({
    reason: "",
    academicYear: "",
    semester: "",
  });

  useEffect(() => {
    async function loadStudent() {
      try {
        const data = await fetchStudentProfile();
        setStudent(data);
      } catch {
        toast.error("Failed to load student info");
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, []);
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "academicYear") {
      setForm({ ...form, academicYear: value, semester: "" });
      return;
    }
    setForm({ ...form, [name]: value });
  }
  function getAcademicYears() {
    const y = new Date().getFullYear();
    return [`${y - 1}/${y}`, `${y}/${y + 1}`];
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/clearance/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      toast.success("Request submitted successfully");
      router.push("/student/dashboard");
    } catch {
      toast.error("Server error");
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-indigo-600 to-indigo-500 text-white">
          <div>
            <h1 className="text-lg font-semibold">Clearance Request</h1>
            <p className="text-xs text-indigo-100">
              Submit your academic clearance application
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white text-xl font-bold"
          >
            <MdClose/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-7">
          {loading ? (
            <p className="text-center text-slate-500 py-10">
              Loading student information...
            </p>
          ) : (
            <>
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Student Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={student.studentId}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                  />
                  <input
                    value={`${student.firstName} ${student.middleName ?? ""} ${student.lastName}`}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                  />
                </div>
              </section>
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Academic Information
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    value={student.faculty?.name}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                  />
                  <input
                    value={student.school?.name}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                  />
                  <input
                    value={student.department?.name}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                  />
                </div>
              </section>
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Request Details
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <select
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required>
                    <option value="">Select Reason</option>
                    {Reasons.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="academicYear"
                    value={form.academicYear}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required >
                    <option value="">Academic Year</option>
                    {getAcademicYears().map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    disabled={!form.academicYear}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none" >
                    <option value="">Choose Semester</option>
                    <option value="First Semester">Semester 1</option>
                    <option value="Second Semester">Semester 2</option>
                  </select>
                </div>
              </section>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition">
                  Submit Request
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}