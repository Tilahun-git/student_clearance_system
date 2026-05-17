"use client";

import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";
import PageHeader from "../PageHeader";
import toast from "react-hot-toast";
import { RoleType } from "@prisma/client";
import { fetchUsers, patchUser, deleteUser } from "@/lib/api/admin";
import UserTable, { type UserRow } from "@/components/tables/UserTable";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";
import { usePagination } from "@/hooks/usePagination";

const PAGE_SIZE = 10;

export default function UserManagement() {
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const [revokingMap, setRevokingMap] = useState<Record<string, string | null>>({});
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);

  function loadUsers() {
    setLoading(true);
    fetchUsers()
      .then((u) => setUsers(u))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, []);

  async function toggleActive(user: UserRow) {
    setTogglingId(user.id);
    const action = user.isActive ? "deactivate" : "activate";
    try {
      await patchUser(user.id, { action });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${action}d`);
    } catch { toast.error("Failed to update status"); }
    finally { setTogglingId(null); }
  }

  async function revokeRole(userId: string, role: string) {
    setRevokingMap((p) => ({ ...p, [userId]: role }));
    try {
      await patchUser(userId, { action: "revoke_role", role });
      setUsers((prev) => prev.map((u) =>
        u.id === userId ? { ...u, roles: u.roles?.filter((r) => r.role.name !== role) } : u
      ));
      toast.success(`Role ${role.replace(/_/g, " ")} revoked`);
    } catch { toast.error("Failed to revoke role"); }
    finally { setRevokingMap((p) => ({ ...p, [userId]: null })); }
  }

  function handleRoleGranted(userId: string, role: RoleType) {
    setUsers((prev) => prev.map((u) =>
      u.id === userId ? { ...u, roles: [...(u.roles ?? []), { role: { name: role } }] } : u
    ));
  }

  async function confirmDeleteUser() {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    try {
      await deleteUser(pendingDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
      toast.success("User deactivated");
      setPendingDelete(null);
    } catch { toast.error("Failed to deactivate user"); }
    finally { setDeletingId(null); }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const adminCount = users.filter((u) =>
    u.roles?.some((r) => r.role.name === RoleType.ADMIN)
  ).length;

  const { page, totalPages, totalItems, paged, goTo } = usePagination(filtered, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        icon={Users}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        title="User Management"
        subtitle="Manage staff accounts, roles and access"
        action={{ href: "/admin/create-user", label: "Add User", color: "bg-indigo-600 hover:bg-indigo-700" }}
        badge={
          !loading ? (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {users.length} total
            </span>
          ) : undefined
        }
      />

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); goTo(1); }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      <UserTable
        users={paged}
        loading={loading}
        search={search}
        togglingId={togglingId}
        revokingMap={revokingMap}
        deletingId={deletingId}
        adminCount={adminCount}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={goTo}
        onToggleActive={toggleActive}
        onRevokeRole={revokeRole}
        onRoleGranted={handleRoleGranted}
        onDelete={(user) => setPendingDelete(user)}
      />

      <ConfirmDeleteModal
        open={!!pendingDelete}
        title="Deactivate User"
        description={`"${pendingDelete?.name}" will be deactivated and lose access to the system.`}
        confirmLabel="Deactivate"
        loading={!!deletingId}
        onConfirm={confirmDeleteUser}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
