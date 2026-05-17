"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { registerStudent } from "@/lib/api/student";
import { fetchClearanceFormData } from "@/lib/api/admin";

type School     = { id: string; name: string };
type Department = { id: string; name: string; schoolId: string };

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

export default function Register() {
  const { data: session, status } = useSession();

  const [schools, setSchools]         = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);
  const [loading, setLoading]         = useState(false);

  const [form, setForm] = useState({
    firstName:    "",
    middleName:   "",
    lastName:     "",
    program:      "",
    year:         1,
    schoolId:     "",
    departmentId: "",
    section:      "A",
  });

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.roles?.includes("REGISTRAR")) {
      toast.error("Unauthorized");
      window.location.href = "/unauthorized";
    }
  }, [session, status]);

  // Load schools + departments
  useEffect(() => {
    fetchClearanceFormData()
      .then((data) => {
        setSchools(Array.isArray(data.schools)         ? data.schools         : []);
        setDepartments(Array.isArray(data.departments) ? data.departments     : []);
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    const { name, value } = e.target;

    if (name === "schoolId") {
      setFilteredDepts(departments.filter((d) => d.schoolId === value));
      setForm((p) => ({ ...p, schoolId: value, departmentId: "" }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerStudent(form);
      toast.success("Student registered successfully");
      setForm({
        firstName: "", middleName: "", lastName: "",
        program: "", year: 1, schoolId: "", departmentId: "", section: "A",
      });
      setFilteredDepts([]);
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100">
      <div className="flex justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-10 space-y-8 border border-gray-200"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800">Student Registration</h1>
            <p className="text-slate-500 text-sm mt-2">Register a new student into the system</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left — personal info */}
            <div className="space-y-4">
              <input name="firstName"  placeholder="First Name"  value={form.firstName}  onChange={handleChange} className={inputClass} required />
              <input name="middleName" placeholder="Middle Name" value={form.middleName} onChange={handleChange} className={inputClass} />
              <input name="lastName"   placeholder="Last Name"   value={form.lastName}   onChange={handleChange} className={inputClass} required />

              <select name="program" value={form.program} onChange={handleChange} className={inputClass} required>
                <option value="">Select Program</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
              </select>

              <input
                type="number" name="year" min={1} max={6}
                placeholder="Year (e.g. 1)"
                value={form.year} onChange={handleChange}
                className={inputClass} required
              />

              <select name="section" value={form.section} onChange={handleChange} className={inputClass}>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            {/* Right — academic placement */}
            <div className="space-y-4">
              {/* School */}
              <select
                name="schoolId"
                value={form.schoolId}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select School</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Department — filtered by selected school */}
              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                disabled={!form.schoolId}
                className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                required
              >
                <option value="">
                  {form.schoolId ? "Select Department" : "Select school first"}
                </option>
                {filteredDepts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition disabled:opacity-50 font-semibold"
            >
              {loading ? "Registering…" : "Register Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
