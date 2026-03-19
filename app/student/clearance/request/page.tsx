"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ClearanceRequestPage() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);

  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    facultyId: "",
    schoolId: "",
    departmentId: "",
    reason: "",
    academicYear: "",
    semester: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/clearance/data");
        const data = await res.json();

        setFaculties(data.faculties || []);
        setSchools(data.schools || []);
        setDepartments(data.departments || []);
        setReasons(data.reasons || []);
      } catch {
        toast.error("Failed to load data");
      }
    }
    load();
  }, []);

  function handleChange(e: any) {
    const { name, value } = e.target;

    if (name === "facultyId") {
      const filtered = schools.filter(s => s.facultyId === value);
      setFilteredSchools(filtered);
      setFilteredDepartments([]);

      setForm({
        ...form,
        facultyId: value,
        schoolId: "",
        departmentId: "",
      });
      return;
    }

    if (name === "schoolId") {
      const filtered = departments.filter(d => d.schoolId === value);
      setFilteredDepartments(filtered);

      setForm({
        ...form,
        schoolId: value,
        departmentId: "",
      });
      return;
    }

    setForm({ ...form, [name]: value });
  }

  async function submit(e: any) {
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

      toast.success("Request submitted!");

      setForm({
        facultyId: "",
        schoolId: "",
        departmentId: "",
        reason: "",
        academicYear: "",
        semester: "",
      });

      setFilteredSchools([]);
      setFilteredDepartments([]);
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-blue-50 to-purple-100 flex items-center justify-center p-6">

      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-indigo-700">
            Student Clearance Request
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Submit your clearance request by filling the form below
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={submit}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 space-y-6"
        >

          {/* Section Title */}
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Academic Information
          </h2>

          {/* Faculty */}
          <div>
            <label className="label">Faculty</label>
            <select
              name="facultyId"
              value={form.facultyId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Faculty</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* School */}
          <div>
            <label className="label">School</label>
            <select
              name="schoolId"
              value={form.schoolId}
              onChange={handleChange}
              disabled={!form.facultyId}
              className="input disabled:bg-gray-100"
              required
            >
              <option value="">Select School</option>
              {filteredSchools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="label">Department</label>
            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              disabled={!form.schoolId}
              className="input disabled:bg-gray-100"
              required
            >
              <option value="">Select Department</option>
              {filteredDepartments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="border-t pt-4"></div>

          <h2 className="text-lg font-semibold text-gray-700">
            Request Details
          </h2>

          {/* Reason */}
          <div>
            <label className="label">Reason</label>
            <select
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Reason</option>
              {reasons.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="label">Academic Year</label>
            <input
              name="academicYear"
              placeholder="e.g. 2024/2025"
              value={form.academicYear}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Semester */}
          <div>
            <label className="label">Semester</label>
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-black py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>

        </form>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #fff;
          transition: all 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}