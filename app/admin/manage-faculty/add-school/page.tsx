"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { School, Save } from "lucide-react";
import { Faculty } from "@prisma/client";

export default function AddSchool() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [deans, setDeans] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [deanId, setDeanId] = useState("");

  useEffect(() => {
    fetch("/api/faculty")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFaculties(data);
        } else {
          console.error("Invalid faculty response:", data);
          setFaculties([]);
        }
      })
      .catch(() => toast.error("Failed to load faculties"));
  }, []);

useEffect(() => {
  const fetchDeans = async () => {
    try {
      const res = await fetch("/api/staff?role=SCHOOL_DEAN");
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("API ERROR:", data);
        setDeans([]);
        return;
      }

      setDeans(data.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setDeans([]);
      toast.error("Failed to load deans");
    }
  };

  fetchDeans();
}, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !facultyId || !deanId) {
      return toast.error("All fields are required");
    }

    try {
      const res = await fetch("/api/admin/school", {
        method: "POST",
        body: JSON.stringify({ name, facultyId, deanId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.error || "Failed to create school");
      }

      toast.success("School created successfully 🎉");

      setName("");
      setFacultyId("");
      setDeanId("");
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
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-green-100 text-green-700">
            <School />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Add School
          </h2>

          <p className="text-sm text-slate-600">
            Assign school with dean
          </p>
        </div>

        <select
          value={facultyId}
          onChange={(e) => setFacultyId(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900"
        >
          <option value="">Select faculty</option>
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="School name"
          className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900"
        />

        <select
          value={deanId}
          onChange={(e) => setDeanId(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900"
        >
          <option value="">Select dean</option>

          {deans.length > 0 ? (
            deans.map((d) => (
              <option key={d.id} value={d.id}>
                {d.user?.name || "Unnamed"}
              </option>
            ))
          ) : (
            <option disabled>No deans found</option>
          )}
        </select>

        <button
          type="submit"
          className="w-full flex justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl"
        >
          <Save size={18} />
          Create School
        </button>
      </form>
    </div>
  );
}