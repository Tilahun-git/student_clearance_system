"use client";

import { useEffect, useState } from "react";
import { Briefcase, UserCheck } from "lucide-react";
import { loadOffices } from "@/lib/api/offices";
import { assignOfficeManager, deleteOffice } from "@/lib/api/admin";
import PageHeader from "../PageHeader";
import toast from "react-hot-toast";
import OfficeTable, { type OfficeRow } from "@/components/tables/OfficeTable";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";

const PAGE_SIZE = 10;

export default function OfficeManagement() {
  const [offices, setOffices]               = useState<OfficeRow[]>([]);
  const [staffOptions, setStaffOptions]     = useState<any[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [loading, setLoading]               = useState(true);
  const [assigning, setAssigning]           = useState(false);
  const [deletingId, setDeletingId]         = useState<string | null>(null);
  const [pendingDelete, setPendingDelete]   = useState<OfficeRow | null>(null);

  useEffect(() => { fetchOfficeList(); }, []);

  async function fetchOfficeList() {
    try {
      setLoading(true);
      const data = await loadOffices();
      setOffices(Array.isArray(data) ? data : []);
    } catch {
      setOffices([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStaff(officeCode: string, officeId: string) {
    try {
      setSelectedOffice(officeId);
      const res  = await fetch(`/api/staff/by-role/${officeCode}`);
      const data = await res.json();
      setStaffOptions(Array.isArray(data) ? data : []);
    } catch {
      setStaffOptions([]);
    }
  }

  async function handleAssignManager(officeId: string, staffId: string) {
    if (!staffId) return;
    try {
      setAssigning(true);
      await assignOfficeManager(officeId, staffId);
      await fetchOfficeList();
      setSelectedOffice(null);
    } catch {
    } finally {
      setAssigning(false);
    }
  }

  async function confirmDeleteOffice() {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    try {
      await deleteOffice(pendingDelete.id);
      setOffices((prev) => prev.filter((o) => o.id !== pendingDelete.id));
      toast.success("Office deleted");
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete office");
    } finally {
      setDeletingId(null);
    }
  }

  const assignedCount = offices.filter((o) => o.manager?.user?.name).length;
  const { page, totalPages, totalItems, paged, goTo } = usePagination(offices, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        icon={Briefcase}
        iconBg="bg-pink-100"
        iconColor="text-pink-600"
        title="Office Management"
        subtitle="Assign managers to clearance offices"
        action={{ href: "/admin/offices/add", label: "Add Office", color: "bg-pink-600 hover:bg-pink-700" }}
        badge={
          !loading ? (
            <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700">
              <UserCheck size={11} />
              {assignedCount}/{offices.length} assigned
            </span>
          ) : undefined
        }
      />

      <OfficeTable
        offices={paged}
        loading={loading}
        selectedOffice={selectedOffice}
        staffOptions={staffOptions}
        assigning={assigning}
        deletingId={deletingId}
        onLoadStaff={loadStaff}
        onAssignManager={handleAssignManager}
        onCancelAssign={() => setSelectedOffice(null)}
        onDelete={(id) => setPendingDelete(offices.find((o) => o.id === id) ?? null)}
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
        title="Delete Office"
        description={`"${pendingDelete?.office_name}" will be permanently removed from the system.`}
        confirmLabel="Delete Office"
        loading={!!deletingId}
        onConfirm={confirmDeleteOffice}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
