"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchBorrows, addBorrow, updateBorrowStatus, deleteBorrow } from "@/lib/api/library";
import BorrowedStudentsTable, { type BorrowRecord } from "@/components/tables/BorrowedStudentsTable";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";

const PAGE_SIZE = 10;

export default function BorrowedStudents() {
  const [borrows, setBorrows]           = useState<BorrowRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [addInput, setAddInput]         = useState("");
  const [adding, setAdding]             = useState(false);
  const [togglingId, setTogglingId]     = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BorrowRecord | null>(null);

  function loadBorrows() {
    setLoading(true);
    fetchBorrows()
      .then((d) => setBorrows(d as unknown as BorrowRecord[]))
      .catch(() => setBorrows([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadBorrows(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const id = addInput.trim();
    if (!id) return;
    setAdding(true);
    try {
      const data = await addBorrow(id);
      if (data.error) { toast.error(data.error); return; }
      setBorrows((prev) => [data as unknown as BorrowRecord, ...prev]);
      setAddInput("");
      toast.success(`Student ${id} added to borrowed list`);
    } catch {
      toast.error("Server error");
    } finally {
      setAdding(false);
    }
  }

  async function toggleReturned(borrow: BorrowRecord) {
    setTogglingId(borrow.id);
    try {
      const data = await updateBorrowStatus(borrow.id, !borrow.returned);
      if (data.error) throw new Error();
      setBorrows((prev) =>
        prev.map((b) => b.id === borrow.id ? { ...b, returned: !b.returned } : b),
      );
      toast.success(borrow.returned ? "Marked as not returned" : "Marked as returned");
    } catch {
      toast.error("Failed to update");
    } finally {
      setTogglingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    try {
      const data = await deleteBorrow(pendingDelete.id);
      if (data.error) throw new Error(data.error);
      setBorrows((prev) => prev.filter((b) => b.id !== pendingDelete.id));
      toast.success("Borrow record removed");
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete record");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = borrows.filter((b) => {
    const name = `${b.student.firstName} ${b.student.lastName}`.toLowerCase();
    const sid  = b.student.studentId.toLowerCase();
    const q    = search.toLowerCase();
    return name.includes(q) || sid.includes(q);
  });

  const { page, totalPages, totalItems, paged, goTo } = usePagination(filtered, PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-100">
            <BookOpen className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Borrowed Students</h2>
            <p className="text-xs text-slate-500">Track students who borrowed library books</p>
          </div>
        </div>
        {!loading && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {borrows.filter((b) => !b.returned).length} unreturned
          </span>
        )}
      </div>
      <form onSubmit={handleAdd} className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Enter Student ID"
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={adding || !addInput.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
      </form>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or student ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); goTo(1); }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      <BorrowedStudentsTable
        borrows={paged}
        loading={loading}
        search={search}
        togglingId={togglingId}
        deletingId={deletingId}
        onToggleReturned={toggleReturned}
        onDelete={(b) => setPendingDelete(b)}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={goTo}
      />
      <ConfirmDeleteModal
        open={!!pendingDelete}
        title="Remove Borrow Record"
        description={`Remove the borrow record for student "${pendingDelete?.student.studentId}"? This cannot be undone.`}
        confirmLabel="Remove"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
