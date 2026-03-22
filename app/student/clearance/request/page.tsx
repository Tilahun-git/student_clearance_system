"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function ClearanceRequestPage() {
  const { data: session } = useSession();

  const [faculties, setFaculties] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);

  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    facultyId: "",
    schoolId: "",
    departmentId: "",
    reason: "",
    academicYear: "",
    semester: "",
  });

  useEffect(() => {
    if (session?.user?.studentId) {
      setForm((prev) => ({
        ...prev,
        studentId: session.user.studentId || "",
      }));
    }
  }, [session]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/clearance/data");
        const data = await res.json();

        setFaculties(data.faculties);
        setSchools(data.schools);
        setDepartments(data.departments);
        setReasons(data.reasons);
      } catch {
        toast.error("Failed to load data");
      }
    }
    load();
  }, []);

  function handleChange(e: any) {
    const { name, value } = e.target;

    if (name === "facultyId") {
      const filtered = schools.filter((s) => s.facultyId === value);
      setFilteredSchools(filtered);
      setFilteredDepartments([]);

      setForm({ ...form, facultyId: value, schoolId: "", departmentId: "" });
      return;
    }

    if (name === "schoolId") {
      const filtered = departments.filter((d) => d.schoolId === value);
      setFilteredDepartments(filtered);

      setForm({ ...form, schoolId: value, departmentId: "" });
      return;
    }

    setForm({ ...form, [name]: value });
  }

  function clearForm() {
    setForm((prev) => ({
      ...prev,
      facultyId: "",
      schoolId: "",
      departmentId: "",
      reason: "",
      academicYear: "",
      semester: "",
    }));

    setFilteredSchools([]);
    setFilteredDepartments([]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/clearance/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.error);

      toast.success("Request created successfully");
      clearForm();
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-4xl">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Clearance Request
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Fill in your academic details and submit your clearance request
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-8"
        >

          {/* Student Info */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Student Information
            </h2>

            <input
              value={form.studentId}
              readOnly
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="h-px bg-gray-200" />

          {/* Academic Info */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Academic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <select
                name="facultyId"
                value={form.facultyId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                required
              >
                <option value="">Select Faculty</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              <select
                name="schoolId"
                value={form.schoolId}
                onChange={handleChange}
                disabled={!form.facultyId}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 disabled:bg-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                required
              >
                <option value="">Select School</option>
                {filteredSchools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                disabled={!form.schoolId}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 disabled:bg-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                required
              >
                <option value="">Select Department</option>
                {filteredDepartments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

            </div>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Request Details */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Request Details
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <select
                name="reason"
                value={form.reason}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                required
              >
                <option value="">Select Reason</option>
                {reasons.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>

              <input
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                placeholder="Academic Year"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                required
              />

              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                required
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>

            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-md transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>

        </form>
      </div>
    </div>
  );
}