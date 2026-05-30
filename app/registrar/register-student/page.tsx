"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { registerStudent, bulkRegisterStudents } from "@/lib/api/student";
import { fetchClearanceFormData } from "@/lib/api/admin";

type School     = { id: string; name: string };
type Department = { id: string; name: string; schoolId: string };
type BulkImportResult = {
  row: number;
  success: boolean;
  action: "created" | "skipped";
  studentId?: string;
  email?: string;
  userId?: string;
  id?: string;
  error?: string;
};
type BulkImportResponse = {
  message: string;
  summary: { total: number; created: number; skipped: number };
  results: BulkImportResult[];
};

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
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    total: number;
    created: number;
    skipped: number;
  } | null>(null);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.roles?.includes("REGISTRAR")) {
      toast.error("Unauthorized");
      window.location.href = "/unauthorized";
    }
  }, [session, status]);

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

  function handleBulkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBulkResult(null);
    setBulkErrors([]);
    setBulkFile(e.target.files?.[0] ?? null);
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error("Please select a file first.");
      return;
    }

    setBulkLoading(true);
    setBulkResult(null);
    setBulkErrors([]);

    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const data: BulkImportResponse = await bulkRegisterStudents(formData);
      setBulkResult(data.summary);
      setBulkErrors(
        data.results
          .filter((item: BulkImportResult) => !item.success)
          .map((item: BulkImportResult) => `Row ${item.row}: ${item.error ?? "Failed to import"}`)
      );
      toast.success("Bulk import finished.");
      setBulkFile(null);
    } catch (error: any) {
      toast.error(error?.message || "Bulk upload failed. Please try again.");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-indigo-100">
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

            <div className="space-y-4">
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

      <div className="flex justify-center px-4 pb-10">
        <form
          onSubmit={handleBulkSubmit}
          className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-10 space-y-6 border border-gray-200"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Bulk Student Import</h2>
            <p className="text-slate-500 text-sm mt-2">
              Upload a CSV or Excel file to create student accounts in bulk. The file must include headers such as
              <span className="font-medium"> firstName, lastName, email, program, year, departmentName</span>.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">File</label>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleBulkFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="text-slate-500 text-sm">
              Use column headers: firstName, middleName, lastName, email, program, year, section, schoolName, departmentName.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button
              type="submit"
              disabled={bulkLoading || !bulkFile}
              className="px-10 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-lg transition disabled:opacity-50 font-semibold"
            >
              {bulkLoading ? "Importing…" : "Import Students"}
            </button>
            {bulkResult ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Imported <span className="font-semibold">{bulkResult.created}</span> of <span className="font-semibold">{bulkResult.total}</span>{" "}
                rows, skipped <span className="font-semibold">{bulkResult.skipped}</span>.
              </div>
            ) : null}
          </div>

          {bulkErrors.length > 0 ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-semibold">Rows skipped:</p>
              <ul className="list-disc list-inside space-y-1">
                {bulkErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {bulkErrors.length > 5 ? (
                  <li>...and {bulkErrors.length - 5} more errors.</li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
