"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ROLE_TYPES, RoleTypeFrontend } from "@/lib/roles";
import { PlusCircle } from "lucide-react";

export default function AddRolePage() {
  const [role, setRole] = useState<RoleTypeFrontend | "">("");
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    const res = await fetch("/api/admin/roles");
    const data = await res.json();
    setRoles(data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Role added successfully!");
      setRole("");
      fetchRoles();

    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Role Management
          </h1>
          <p className="text-sm text-slate-500">
            Add and manage system roles
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* SELECT */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-600 font-medium">
              Select Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RoleTypeFrontend)}
              className="border border-slate-300 rounded-xl px-3 text-black py-2.5
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              transition"
            >
              <option value="">Choose a role</option>

              {ROLE_TYPES.map((r) => (
                <option key={r} value={r} className="text-black">
                  {r.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2
            bg-indigo-600 hover:bg-indigo-700
            text-white font-medium py-2.5 rounded-xl
            transition shadow-sm disabled:opacity-50"
          >
            <PlusCircle size={16} />
            {loading ? "Adding..." : "Add Role"}
          </button>
        </form>

        {/* ROLES LIST */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-black mb-3">
            Existing Roles
          </h2>

          {roles.length === 0 ? (
            <p className="text-sm text-slate-400">
              No roles found
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <span
                  key={r.id}
                  className="px-3 py-1.5 text-xs rounded-full
                  bg-indigo-50 text-black font-medium
                  border border-indigo-100 hover:bg-indigo-100 transition"
                >
                  {r.name.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}