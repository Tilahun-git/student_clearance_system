"use client";

import {useState } from "react";
import toast from "react-hot-toast";
import { School, Save } from "lucide-react";

export default function AddSchool() {
  const [name, setName]           = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("All fields are required");

    try {
      const res = await fetch("/api/admin/school", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Failed to create school");
      toast.success("School created successfully");
      setName("");
    } catch {
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="flex-1 flex items-center justify-center overflow-y-auto bg-slate-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-300 p-8 space-y-5"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-green-100 text-green-700">
            <School />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Add School</h2>
          <p className="text-sm text-slate-600">
            Create a school — assign a dean from the Schools table afterwards
          </p>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="School name"
          required
          className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900"
        />
        <button
          type="submit"
          className="w-full flex justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white py-2.5 rounded-xl"
        >
          <Save size={18} />
          Create School
        </button>
      </form>
    </div>
  );
}
