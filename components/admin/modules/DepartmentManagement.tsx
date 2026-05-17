"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import PageHeader from "../PageHeader";
import toast from "react-hot-toast";
import {
  fetchDepartments,
  assignDepartmentHead,
  deleteDepartment,
} from "@/lib/api/admin";

import DepartmentTable, {
  type DepartmentRow,
} from "@/components/tables/DepartmentTable";

import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";

const PAGE_SIZE = 10;

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [headOptions, setHeadOptions] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<DepartmentRow | null>(null);

  function loadDepartments() {
    setLoading(true);
    fetchDepartments()
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  // ✅ FIXED: now receives full department object
  async function openAssign(dept: DepartmentRow) {
    setSelectedDept(dept.id);

    const params = new URLSearchParams();

    if (dept.id) params.append("departmentId", dept.id);
    if (dept.schoolId) params.append("schoolId", dept.schoolId);

    const res = await fetch(
      `/api/staff/by-role/DEPARTMENT_HEAD?${params.toString()}`
    );

    const data = await res.json();
    setHeadOptions(Array.isArray(data) ? data : []);
  }

  async function handleAssignHead(departmentId: string, headId: string) {
    if (!headId) return;

    setAssigning(true);
    try {
      await assignDepartmentHead(departmentId, headId);
      loadDepartments();
      setSelectedDept(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to assign head");
    } finally {
      setAssigning(false);
    }
  }

  async function confirmDeleteDepartment() {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);

    try {
      await deleteDepartment(pendingDelete.id);
      setDepartments((prev) =>
        prev.filter((d) => d.id !== pendingDelete.id)
      );
      toast.success("Department deleted");
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department");
    } finally {
      setDeletingId(null);
    }
  }

  const { page, totalPages, totalItems, paged, goTo } =
    usePagination(departments, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        icon={Building2}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        title="Department Management"
        subtitle="Manage departments and assign heads"
        action={{
          href: "/admin/manage-faculty/add-department",
          label: "Add Department",
          color: "bg-purple-600 hover:bg-purple-700",
        }}
        badge={
          !loading && departments.length > 0 ? (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {departments.length} total
            </span>
          ) : undefined
        }
      />

      <DepartmentTable
        departments={paged}
        loading={loading}
        selectedDept={selectedDept}
        headOptions={headOptions}
        assigning={assigning}
        deletingId={deletingId}
        onOpenAssign={openAssign}
        onAssignHead={handleAssignHead}
        onCancelAssign={() => setSelectedDept(null)}
        onDelete={(id) =>
          setPendingDelete(departments.find((d) => d.id === id) ?? null)
        }
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
        title="Delete Department"
        description={`"${pendingDelete?.name}" and all its data will be permanently removed.`}
        confirmLabel="Delete Department"
        loading={!!deletingId}
        onConfirm={confirmDeleteDepartment}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}