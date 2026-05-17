"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Save } from "lucide-react";
import { fetchSchools, createDepartment } from "@/lib/api/admin";

type School = { id: string; name: string };

export default function AddDepartment() {
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [name, setName]         = useState("");

  useEffect(() => {
    fetchSchools()
      .then((data) => setSchools(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load schools"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !schoolId) return toast.error("All fields are required");
    try {
      await createDepartment(name, schoolId);
      toast.success("Department created successfully");
      setName("");
      setSchoolId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create department");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center overflow-y-auto bg-slate-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-300 p-8 space-y-5"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <Building2 />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Add Department</h2>
          <p className="text-sm text-slate-600">
            Create a department — assign a head from the Departments table afterwards
          </p>
        </div>

        <select
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
        >
          <option value="">Select school</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Department name"
          required
          className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900"
        />
        <button
          type="submit"
          className="w-full flex justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl"
        >
          <Save size={18} />
          Create Department
        </button>
      </form>
    </div>
  );
}
