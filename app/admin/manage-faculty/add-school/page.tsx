"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { School, Save } from "lucide-react";

export default function AddSchool() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [facultyId, setFacultyId] = useState("");

  useEffect(() => {
    fetch("/api/faculty")
      .then(res => res.json())
      .then(setFaculties)
      .catch(() => toast.error("Failed to load faculties"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/school", {
      method: "POST",
      body: JSON.stringify({ name, facultyId }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("School added successfully 🎉");

    setName("");
    setFacultyId("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-green-100 p-6">
      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <School />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Add School
          </h2>

          <p className="text-sm text-gray-500">
            Assign a school under a faculty
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium">
            Select Faculty
          </label>

          <select
            value={facultyId}
            onChange={e => setFacultyId(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="">Choose a faculty</option>
            {faculties.map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium">
            School Name
          </label>

          <input
            placeholder="e.g. School of Computing"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-green-600 to-emerald-600 text-black py-2.5 rounded-xl font-medium shadow-md hover:opacity-90 transition active:scale-[0.98]"
        >
          <Save size={18} />
          Add School
        </button>

      </form>
    </div>
  );
}