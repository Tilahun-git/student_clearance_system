"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  ShieldCheck, Plus, Hash, Mail, Users,
  Pencil, Trash2, X, User, AlertTriangle,
} from "lucide-react";
import AddProctorModal from "@/components/super-proctor/AddProctorModal";

// ── Types ─────────────────────────────────────────────────────────────────────
type Proctor = {
  id:          string;
  userId:      string;
  firstName:   string;
  lastName:    string;
  middleName:  string | null;
  email:       string;
  blockNumber: number | null;
};

type EditForm = {
  firstName:   string;
  lastName:    string;
  middleName:  string;
  email:       string;
  blockNumber: string;
};

const inputClass =
  "w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition placeholder:text-slate-400";

// ── Component ─────────────────────────────────────────────────────────────────
export default function ManageProctorsSection() {
  const [proctors, setProctors]         = useState<Proctor[]>([]);
  const [loading, setLoading]           = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit state
  const [editTarget, setEditTarget]   = useState<Proctor | null>(null);
  const [editForm, setEditForm]       = useState<EditForm | null>(null);
  const [saving, setSaving]           = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Proctor | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { loadProctors(); }, []);

  async function loadProctors() {
    try {
      setLoading(true);
      const res  = await fetch("/api/super-proctor/proctors");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch proctors");
      setProctors(data.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  function openEdit(p: Proctor) {
    setEditTarget(p);
    setEditForm({
      firstName:   p.firstName,
      lastName:    p.lastName,
      middleName:  p.middleName ?? "",
      email:       p.email,
      blockNumber: p.blockNumber != null ? String(p.blockNumber) : "",
    });
  }

  function closeEdit() { setEditTarget(null); setEditForm(null); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !editForm) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/super-proctor/proctors/${editTarget.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:   editForm.firstName.trim(),
          lastName:    editForm.lastName.trim(),
          middleName:  editForm.middleName.trim() || null,
          email:       editForm.email.trim().toLowerCase(),
          blockNumber: editForm.blockNumber ? Number(editForm.blockNumber) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");

      toast.success("Proctor updated successfully");
      closeEdit();
      await loadProctors();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/super-proctor/proctors/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");

      toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} removed`);
      setDeleteTarget(null);
      await loadProctors();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-100">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Manage Proctors</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {proctors.length} proctor{proctors.length !== 1 ? "s" : ""} registered
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm"
          >
            <Plus size={15} />
            Add Proctor
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {proctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                <Users size={32} className="text-slate-300" />
                <p className="text-sm">No proctors registered yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition mt-1"
                >
                  <Plus size={14} />
                  Register First Proctor
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-xs uppercase tracking-wider text-slate-500">
                    <th className="text-left p-4 font-semibold">#</th>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Block</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proctors.map((proctor, idx) => (
                    <tr
                      key={proctor.id}
                      className="border-b last:border-0 hover:bg-slate-50 transition"
                    >
                      <td className="p-4 text-xs text-slate-400">{idx + 1}</td>

                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-violet-700">
                              {proctor.firstName[0]}{proctor.lastName[0]}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800">
                            {proctor.firstName}{" "}
                            {proctor.middleName ? proctor.middleName + " " : ""}
                            {proctor.lastName}
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          {proctor.email}
                        </div>
                      </td>

                      <td className="p-4">
                        {proctor.blockNumber != null ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
                            <Hash size={11} />
                            Block {proctor.blockNumber}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(proctor)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(proctor)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Add Proctor Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <AddProctorModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadProctors}
        />
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {editTarget && editForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeEdit()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="h-1.5 w-full bg-violet-500" />

              <div className="flex items-start justify-between px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-100">
                    <Pencil className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Edit Proctor</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {editTarget.firstName} {editTarget.lastName}
                    </p>
                  </div>
                </div>
                <button onClick={closeEdit} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSave} className="px-5 pb-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {(["firstName", "lastName"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5 capitalize">
                        {field === "firstName" ? "First Name" : "Last Name"} <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={editForm[field]}
                          onChange={(e) => setEditForm((f) => f ? { ...f, [field]: e.target.value } : f)}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Middle Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={editForm.middleName}
                      onChange={(e) => setEditForm((f) => f ? { ...f, middleName: e.target.value } : f)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => f ? { ...f, email: e.target.value } : f)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Block Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      value={editForm.blockNumber}
                      onChange={(e) => setEditForm((f) => f ? { ...f, blockNumber: e.target.value } : f)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={closeEdit} className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {deleteTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
              <div className="h-1.5 w-full bg-red-500" />

              <div className="px-5 pt-5 pb-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Delete Proctor</h2>
                    <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {deleteTarget.firstName} {deleteTarget.lastName}
                  </span>
                  ? Their user account will also be removed and any students assigned to them will be unassigned.
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {deleting ? "Deleting…" : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
