"use client";

import { useState } from "react";
import { createOffice } from "@/lib/api/offices";
import { useRouter } from "next/navigation";

export default function AddOfficePage() {
  const router = useRouter();
  const [officeName, setOfficeName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!officeName || !code) return;

    try {
      setLoading(true);
      await createOffice({
        office_name: officeName,
        code: code.toUpperCase(),
      });
      setOfficeName("");
      setCode("");
      router.push("/admin/offices");
    } catch (err) {
      console.error(err);
      alert("Failed to create office");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-5">
            <h1 className="text-xl font-semibold text-black text-center">
              Create New Office
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-black">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Office Name
              </label>
              <input
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="Enter office name"
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-300
                           focus:outline-none focus:ring-2 focus:ring-slate-500
                           focus:border-slate-500 transition"/>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Office Code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter office code"
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-300
                           focus:outline-none focus:ring-2 focus:ring-slate-500
                           focus:border-slate-500 transition" />
              <p className="text-xs text-slate-400 mt-1">
                This must match workflow role name
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => router.push("/admin/offices")}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600
                           hover:bg-slate-50 transition">
                Cancel
              </button>
              <button
                disabled={loading}
                className={`px-5 py-2 rounded-xl text-white font-medium transition
                  ${loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-300 hover:bg-blue-600"
                  }`}>
                {loading ? "Creating..." : "Create Office"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}