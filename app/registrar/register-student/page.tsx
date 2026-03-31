"use client";

import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Faculty, School, Department } from "@/types/clearance";

export default function Register() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  const [form, setForm] = useState({
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    program: "",
    year: 1,
    facultyId: "",
    schoolId: "",
    departmentId: "",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/clearance/data");
      const data = await res.json();

      setFaculties(data.faculties);
      setSchools(data.schools);
      setDepartments(data.departments);
    }

    load();
  }, []);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

  function handleChange(
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) {
    const { name, value } = e.target;

    if (name === "facultyId") {
      const filtered = schools.filter((s) => s.facultyId === value);

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
      const filtered = departments.filter((d) => d.schoolId === value);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/registrar/register-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("Student registered successfully");

    setForm({
      studentId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      program: "",
      year: 1,
      facultyId: "",
      schoolId: "",
      departmentId: "",
    });

    setFilteredSchools([]);
    setFilteredDepartments([]);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-indigo-100">
      <DashBoardNavbar />

      <div className="flex justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl p-10 space-y-10 border border-gray-200"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800">
              Student Registration
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Register a new student into the system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <input
                name="studentId"
                placeholder="Student ID"
                value={form.studentId}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <input
                name="middleName"
                placeholder="Middle Name (Optional)"
                value={form.middleName}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <select
                name="program"
                value={form.program}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Program</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
              </select>

              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-5">
              <select
                name="facultyId"
                value={form.facultyId}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>

              <select
                name="schoolId"
                value={form.schoolId}
                onChange={handleChange}
                disabled={!form.facultyId}
                className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-400`}
                required
              >
                <option value="">Select School</option>
                {filteredSchools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>

              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                disabled={!form.schoolId}
                className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-400`}
                required
              >
                <option value="">Select Department</option>
                {filteredDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>

            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-3 bg-slate-600 text-white rounded-xl shadow-lg hover:bg-slate-700 hover:scale-105 transition"
            >
              Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}