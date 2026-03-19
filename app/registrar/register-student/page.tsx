"use client";

import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Register() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    userId: "",
    studentId: "",
    program: "",
    year: 1,
    facultyId: "",
    schoolId: "",
    departmentId: "",
    advisorId: "",
  });

  useEffect(() => {
    fetch("/api/faculty")
      .then(res => res.json())
      .then(setFaculties);

    fetch("/api/staff/advisors")
      .then(res => res.json())
      .then(setAdvisors);

    fetch("/api/student-users")
      .then(res => res.json())
      .then(setUsers);
  }, []);

  const inputClass =
    "w-full px-4 py-3 text-black rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/registrar/register-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("Student registered!");

    setForm({
      userId: "",
      studentId: "",
      program: "",
      year: 1,
      facultyId: "",
      schoolId: "",
      departmentId: "",
      advisorId: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-linear-to-br from-gray-100 via-blue-50 to-indigo-100" >
      <DashBoardNavbar/>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl space-y-6"
      >

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Student Registration
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="space-y-4">

       <select
          className={inputClass}
          value={form.userId}
          onChange={(e) =>
            setForm({ ...form, userId: e.target.value })
          }
        >
          <option value="">Select User</option>

          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>

            <input
              className={inputClass}
              placeholder="Student ID"
              value={form.studentId}
              onChange={(e) =>
                setForm({ ...form, studentId: e.target.value })
              }
            />

            <input
              className={inputClass}
              placeholder="Program"
              value={form.program}
              onChange={(e) =>
                setForm({ ...form, program: e.target.value })
              }
            />

            <input
              type="number"
              className={inputClass}
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: Number(e.target.value) })
              }
            />

          </div>

          <div className="space-y-4">

            <select
              className={inputClass}
              value={form.facultyId}
              onChange={(e) =>
                setForm({
                  ...form,
                  facultyId: e.target.value,
                  schoolId: "",
                  departmentId: "",
                })
              }
            >
              <option value="">Select Faculty</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            {form.facultyId && (
              <select
                className={inputClass}
                value={form.schoolId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    schoolId: e.target.value,
                    departmentId: "",
                  })
                }
              >
                <option value="">Select School</option>

                {faculties
                  .find((f) => f.id === form.facultyId)
                  ?.schools?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            )}

            {form.schoolId && (
              <select
                className={inputClass}
                value={form.departmentId}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
              >
                <option value="">Select Department</option>

                {faculties
                  .find((f) => f.id === form.facultyId)
                  ?.schools?.find((s: any) => s.id === form.schoolId)
                  ?.departments?.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            )}

       <select
          className={inputClass}
          value={form.advisorId}
          onChange={(e) =>
            setForm({ ...form, advisorId: e.target.value })
          }
        >
          <option value="">Select Advisor</option>

          {advisors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.user?.name}
            </option>
          ))}
        </select>

          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-black rounded-xl shadow-lg hover:scale-105 transition"
          >
            Register Student
          </button>
        </div>

      </form>
    </div>
  );
}