"use client";

import { Loader2, ShieldPlus, ChevronDown, X, Trash2, Lock } from "lucide-react";
import { useState } from "react";
import { RoleType } from "@prisma/client";
import { ROLE_TYPES } from "@/lib/roles";
import { patchUser } from "@/lib/api/admin";
import toast from "react-hot-toast";
import Pagination from "@/components/UI/Pagination";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roles?: { role: { name: RoleType } }[];
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN:           "bg-red-50 text-red-700 border-red-100",
  ADVISOR:         "bg-blue-50 text-blue-700 border-blue-100",
  DEPARTMENT_HEAD: "bg-purple-50 text-purple-700 border-purple-100",
  SCHOOL_DEAN:     "bg-indigo-50 text-indigo-700 border-indigo-100",
  REGISTRAR:       "bg-amber-50 text-amber-700 border-amber-100",
  LIBRARY:         "bg-teal-50 text-teal-700 border-teal-100",
  FINANCE:         "bg-green-50 text-green-700 border-green-100",
  STUDENT_DEAN:    "bg-pink-50 text-pink-700 border-pink-100",
  CAFETERIA:       "bg-orange-50 text-orange-700 border-orange-100",
  DORMITORY:       "bg-cyan-50 text-cyan-700 border-cyan-100",
  CAMPUS_POLICE:   "bg-slate-50 text-slate-700 border-slate-200",
};

function RoleBadge({ name, onRevoke, revoking, locked }: {
  name: string; onRevoke?: () => void; revoking?: boolean; locked?: boolean;
}) {
  const color = ROLE_COLORS[name] ?? "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 text-xs font-medium rounded-full border ${color}`}>
      {name.replace(/_/g, " ")}
      {locked ? (
        // Last admin — show lock icon, no revoke button
        <span
          className="ml-0.5 p-0.5 text-amber-500"
          title="Cannot revoke — last admin in the system"
        >
          <Lock size={9} />
        </span>
      ) : onRevoke ? (
        <button onClick={onRevoke} disabled={revoking}
          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition disabled:opacity-50"
          title={`Revoke ${name}`}>
          {revoking ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
        </button>
      ) : null}
    </span>
  );
}

function Toggle({ checked, onChange, loading }: { checked: boolean; onChange: () => void; loading: boolean }) {
  return (
    <button onClick={onChange} disabled={loading}
      title={checked ? "Deactivate user" : "Activate user"}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-emerald-500" : "bg-slate-300"}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

function GrantRoleDropdown({ userId, existingRoles, onGranted }: {
  userId: string; existingRoles: string[]; onGranted: (role: RoleType) => void;
}) {
  const [open, setOpen] = useState(false);
  const [granting, setGranting] = useState<string | null>(null);

  // All non-student roles that this user doesn't already have
  const available = ROLE_TYPES.filter(
    (r) => r !== RoleType.STUDENT && !existingRoles.map((e) => e.toUpperCase()).includes(r),
  );

  async function grant(role: RoleType) {
    setGranting(role);
    try {
      await patchUser(userId, { action: "grant_role", role });
      onGranted(role);
      toast.success(`Role ${role.replace(/_/g, " ")} granted`);
    } catch { toast.error("Failed to grant role"); }
    finally { setGranting(null); setOpen(false); }
  }

  if (available.length === 0) return null;
  return (
    <div className="relative">
      <button onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition">
        <ShieldPlus size={12} />
        Grant
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-1 z-20 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
            {available.map((r) => (
              <button key={r} onClick={() => grant(r as RoleType)} disabled={granting === r}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
                {granting === r ? <Loader2 size={11} className="animate-spin text-indigo-500" /> : <ShieldPlus size={11} className="text-indigo-400" />}
                {r.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>{[1,2,3,4,5].map((i) => (
      <td key={i} className="px-5 py-4"><div className="skeleton h-4 rounded w-3/4" /></td>
    ))}</tr>
  );
}

type Props = {
  users: UserRow[];
  loading: boolean;
  search: string;
  togglingId: string | null;
  revokingMap: Record<string, string | null>;
  deletingId: string | null;
  adminCount: number;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onToggleActive: (user: UserRow) => void;
  onRevokeRole: (userId: string, role: string) => void;
  onRoleGranted: (userId: string, role: RoleType) => void;
  onDelete: (user: UserRow) => void;
};

export default function UserTable({
  users, loading, search, togglingId, revokingMap, deletingId, adminCount,
  page, totalPages, totalItems, pageSize, onPageChange,
  onToggleActive, onRevokeRole, onRoleGranted, onDelete,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="overflow-x-auto rounded-t-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Roles</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-center">Active</th>
              <th className="px-5 py-3.5">Grant Role</th>
              <th className="px-5 py-3.5">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                  {search ? "No users match your search." : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const roleNames = u.roles?.map((r) => r.role.name) ?? [];
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-medium text-slate-800 truncate max-w-[120px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs truncate max-w-[160px]">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {roleNames.length ? (
                          roleNames.map((name) => {
                            const isLastAdmin = name === "ADMIN" && adminCount <= 1;
                            return (
                              <RoleBadge
                                key={name}
                                name={name}
                                onRevoke={isLastAdmin ? undefined : () => onRevokeRole(u.id, name)}
                                revoking={revokingMap[u.id] === name}
                                locked={isLastAdmin}
                              />
                            );
                          })
                        ) : <span className="text-xs text-slate-400">No role</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${u.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-red-400"}`} />
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Toggle checked={u.isActive} onChange={() => onToggleActive(u)} loading={togglingId === u.id} />
                    </td>
                    <td className="px-5 py-3.5">
                      <GrantRoleDropdown userId={u.id} existingRoles={roleNames}
                        onGranted={(role) => onRoleGranted(u.id, role)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => onDelete(u)} disabled={deletingId === u.id}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                        title="Deactivate user">
                        {deletingId === u.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-5 py-3">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
