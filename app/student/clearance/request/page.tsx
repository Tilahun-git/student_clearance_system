"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Faculty,
  School,
  Department,
  Reason,
  ClearanceDataResponse
} from "@/types/clearance";




export default function ClearanceRequestPage() {
  const { data: session } = useSession();

const [faculties, setFaculties] = useState<Faculty[]>([]);
const [schools, setSchools] = useState<School[]>([]);
const [departments, setDepartments] = useState<Department[]>([]);
const [reasons, setReasons] = useState<Reason[]>([]);

const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);


  const [form, setForm] = useState({
    studentId: "",
    facultyId: "",
    schoolId: "",
    departmentId: "",
    reason: "",
    academicYear: "",
    semester: "",
  });



console.log("Student ID :",session?.user.studentId)

  
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
        const data: ClearanceDataResponse = await res.json();

      console.log("fetched data are",data.schools);

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

  function handleChange(e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement
    >) {
      const { name, value } = e.target;

      if (name === "facultyId") {
        const filtered = schools.filter(
          (s) => String(s.facultyId) === String(value)
        );

        setFilteredSchools(filtered);
        setFilteredDepartments([]);

        setForm({ ...form, facultyId: value, schoolId: "", departmentId: "" });
        return;
      }

      if (name === "schoolId") {
        const filtered = departments.filter(
          (d) => String(d.schoolId) === String(value)
        );

        setFilteredDepartments(filtered);

        setForm({ ...form, schoolId: value, departmentId: "" });
        return;
      }
      if (name === "academicYear") {
    setForm({ ...form, academicYear: value, semester: "" });
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

  function getAcademicYears() {
  const currentYear = new Date().getFullYear();

  return [
    `${currentYear - 1}/${currentYear}`,
    `${currentYear}/${currentYear + 1}`,
  ];
}

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
    } 
  }

  return (
<div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Clearance Request
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Fill in your academic details and submit your clearance request
          </p>
        </div>

       <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10 space-y-10"
          >

            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Student Information
              </h2>

              <input
                value={form.studentId}
                readOnly
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div className="h-px bg-gray-200" />

            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Academic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <select
                  name="facultyId"
                  value={form.facultyId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  required
                >
                  <option value="" className="text-gray-400">
                    Select Faculty
                  </option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id} className="text-gray-800">
                      {f.name}
                    </option>
                  ))}
                </select>

                <select
                  name="schoolId"
                  value={form.schoolId}
                  onChange={handleChange}
                  disabled={!form.facultyId}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  required
                >
                  <option value="" className="text-gray-400">
                    Select School
                  </option>
                  {filteredSchools.map(s => (
                    <option key={s.id} value={s.id} className="text-gray-800">
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  disabled={!form.schoolId}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  required
                >
                  <option value="" className="text-gray-400">
                    Select Department
                  </option>
                  {filteredDepartments.map(d => (
                    <option key={d.id} value={d.id} className="text-gray-800">
                      {d.name}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            <div className="h-px bg-gray-200" />

            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Request Details
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <select
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  required
                >
                  <option value="" className="text-gray-400">
                    Select Reason
                  </option>
                  {reasons.map(r => (
                    <option key={r.id} value={r.name} className="text-gray-800">
                      {r.name}
                    </option>
                  ))}
                </select>

                 <select
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  required
                >
                  <option value="" className="text-gray-400">
                    Select Academic Year
                  </option>

                  {getAcademicYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              disabled={!form.academicYear}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                        bg-white text-gray-800
                        disabled:bg-gray-100 disabled:text-gray-400 
                        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                        outline-none transition"
              required
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>

              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-500 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold shadow-md transition disabled:opacity-60"
            >
              Submit Request
            </button>

          </form>
      </div>
    </div>
  );
}