"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Save } from "lucide-react";

export default function AddDepartment() {
  const [schools, setSchools] = useState<any[]>([]);
  const [heads, setHeads] = useState<any[]>([]);

  const [schoolId, setSchoolId] = useState("");
  const [headId, setHeadId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/school")
      .then(res => res.json())
      .then(setSchools)
      .catch(() => toast.error("Failed to load schools"));
  }, []);

  useEffect(() => {
    fetch("/api/staff?role=DEPARTMENT_HEAD")
      .then(res => res.json())
      .then(setHeads)
      .catch(() => toast.error("Failed to load department heads"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !schoolId || !headId) {
      return toast.error("All fields are required");
    }

    try {
      const res = await fetch("/api/admin/department", {
        method: "POST",
        body: JSON.stringify({ name, schoolId, headId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.error || "Failed to create department");
      }

      toast.success("Department created successfully 🎉");
      setName("");
      setSchoolId("");
      setHeadId("");

    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-300 p-8 space-y-5"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <Building2 />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Add Department
          </h2>

          <p className="text-sm text-slate-600">
            Create department and assign head
          </p>
        </div>

        <select
          value={schoolId}
          onChange={e => setSchoolId(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
        >
          <option value="">Select school</option>
          {schools.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Department name"
          className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900"
        />

        <select
          value={headId}
          onChange={e => setHeadId(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900"
        >
          <option value="">Select department head</option>
          {heads.map(h => (
            <option key={h.id} value={h.id}>
              {h.user?.name}
            </option>
          ))}
        </select>

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