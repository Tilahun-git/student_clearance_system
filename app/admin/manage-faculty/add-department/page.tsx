"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Save } from "lucide-react";

export default function AddDepartment() {
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/school")
      .then(res => res.json())
      .then(setSchools)
      .catch(() => toast.error("Failed to load schools"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/department", {
      method: "POST",
      body: JSON.stringify({ name, schoolId }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("Department added");

    setName("");
    setSchoolId("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-100 flex items-center justify-center p-6">
      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-8 space-y-6"
      >
        
        <div className="text-center space-y-1">
          <div className="flex justify-center">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Building2 />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Add Department
          </h2>
          <p className="text-sm text-gray-500">
            Assign a department under a school
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 font-medium">
            Select School
          </label>
          <select
            value={schoolId}
            onChange={e => setSchoolId(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="">Choose a school</option>
            {schools.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium">
            Department Name
          </label>
          <input
            placeholder="e.g. Computer Science"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 text-black py-2.5 rounded-xl font-medium shadow-md hover:opacity-90 transition"
        >
          <Save size={18} />
          Add Department
        </button>

      </form>
    </div>
  );
}