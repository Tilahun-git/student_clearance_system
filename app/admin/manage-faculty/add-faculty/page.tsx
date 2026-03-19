"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Building2, Save } from "lucide-react";

export default function AddFaculty() {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/faculty", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("Faculty added successfully 🎉");
    setName("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-100 p-6">
      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-8 space-y-6"
      >
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Building2 />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Add Faculty
          </h2>

          <p className="text-sm text-gray-500">
            Create a new faculty in the system
          </p>
        </div>

        {/* Input */}
        <div>
          <label className="text-sm text-gray-600 font-medium">
            Faculty Name
          </label>

          <input
            placeholder="e.g. Faculty of Engineering"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-black py-2.5 rounded-xl font-medium shadow-md hover:opacity-90 transition active:scale-[0.98]"
        >
          <Save size={18} />
          Add Faculty
        </button>

      </form>
    </div>
  );
}