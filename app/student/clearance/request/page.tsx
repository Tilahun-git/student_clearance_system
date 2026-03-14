"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function ClearanceRequestPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    school: "",
    department: "",
    program: "",
    reason: "",
    academicYear: "",
    semester: "",
  });

  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/clearance/data");
      const data = await res.json();
      setSchools(data.schools);
      setDepartments(data.departments);
      setReasons(data.reasons);
    }
    loadData();
  }, []);

  function handleChange(e: any) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "school") {
      const deps = departments.filter((d) => d.schoolId === value);
      setFilteredDepartments(deps);
      setForm({ ...form, school: value, department: "" });
    }
  }

  async function submitRequest(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/clearance/request", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Request submitted successfully!");
        setForm({
          school: "",
          department: "",
          program: "",
          reason: "",
          academicYear: "",
          semester: "",
        });
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-start p-6 overflow-y-auto">
      <form
        onSubmit={submitRequest}
        className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-lg space-y-6 mb-8"
      >
        <h1 className="text-3xl font-bold text-center text-indigo-700">
          Clearance Request
        </h1>
        <p className="text-center text-gray-500">
          Fill out the form below to submit your clearance request.
        </p>

        {/* SCHOOL */}
        <select
          name="school"
          value={form.school}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* DEPARTMENT */}
        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50"
          disabled={!form.school}
        >
          <option value="">Select Department</option>
          {filteredDepartments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* PROGRAM */}
        <select
          name="program"
          value={form.program}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          <option value="">Program</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="postgraduate">Postgraduate</option>
        </select>

        {/* REASON */}
        <select
          name="reason"
          value={form.reason}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          <option value="">Reason</option>
          {reasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        {/* ACADEMIC YEAR */}
        <select
          name="academicYear"
          value={form.academicYear}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          <option value="">Academic Year</option>
          <option value="2023/2024">2023/2024</option>
          <option value="2024/2025">2024/2025</option>
        </select>

        {/* SEMESTER */}
        <select
          name="semester"
          value={form.semester}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          <option value="">Semester</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-black font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Request"} <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}