"use client";

import { useEffect, useState } from "react";
import { PlusCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../PageHeader";
import { fetchRoles, createRole } from "@/lib/api/admin";

export default function RoleManagement() {
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadRoles() {
    setLoadingRoles(true);
    try {
      const data = await fetchRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load roles");
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedRole = role.trim();
    if (!normalizedRole) {
      toast.error("Please enter a role name");
      return;
    }

    setSubmitting(true);
    try {
      await createRole(normalizedRole);
      toast.success("Role added successfully");
      setRole("");
      await loadRoles();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create role";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={ShieldCheck}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        title="Role Management"
        subtitle="Create and review system roles"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Add a new role</h3>
              <p className="text-xs text-slate-500">Choose a role type and create it in the system.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Role name
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter a custom role name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !role.trim()}
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusCircle size={14} />
              {submitting ? "Creating..." : "Add Role"}
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Existing roles</h3>
              <p className="text-xs text-slate-500">Current roles available in the system.</p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {loadingRoles ? "Loading" : `${roles.length} total`}
            </span>
          </div>

          {loadingRoles ? (
            <div className="text-sm text-slate-400">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
              No roles have been created yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {roles.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                >
                  {item.name.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
