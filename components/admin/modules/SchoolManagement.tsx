"use client";

import { useEffect, useState } from "react";
import { School } from "lucide-react";
import PageHeader from "../PageHeader";
import toast from "react-hot-toast";
import {
  fetchSchools,
  assignSchoolDean,
  deleteSchool,
} from "@/lib/api/admin";

import SchoolTable, { type SchoolRow } from "@/components/tables/SchoolTable";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";

const PAGE_SIZE = 10;

export default function SchoolManagement() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [deanOptions, setDeanOptions] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SchoolRow | null>(null);

  function loadSchools() {
    setLoading(true);
    fetchSchools()
      .then((data) => setSchools(Array.isArray(data) ? data : []))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSchools();
  }, []);

  // ✅ FIXED: now receives full object
  async function openAssign(school: SchoolRow) {
    setSelectedSchool(school.id);

    const params = new URLSearchParams();

    if (school.id) {
      params.append("schoolId", school.id);
    }

    const res = await fetch(
      `/api/staff/by-role/SCHOOL_DEAN?${params.toString()}`
    );

    const data = await res.json();
    setDeanOptions(Array.isArray(data) ? data : []);
  }

  async function handleAssignDean(schoolId: string, deanId: string) {
    if (!deanId) return;

    setAssigning(true);
    try {
      await assignSchoolDean(schoolId, deanId);
      loadSchools();
      setSelectedSchool(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to assign dean");
    } finally {
      setAssigning(false);
    }
  }

  async function confirmDeleteSchool() {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);

    try {
      await deleteSchool(pendingDelete.id);
      setSchools((prev) =>
        prev.filter((s) => s.id !== pendingDelete.id)
      );
      toast.success("School deleted");
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete school");
    } finally {
      setDeletingId(null);
    }
  }

  const { page, totalPages, totalItems, paged, goTo } =
    usePagination(schools, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        icon={School}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        title="School Management"
        subtitle="Manage schools and assign deans"
        action={{
          href: "/admin/manage-faculty/add-school",
          label: "Add School",
          color: "bg-blue-600 hover:bg-blue-700",
        }}
      />

      <SchoolTable
        schools={paged}
        loading={loading}
        selectedSchool={selectedSchool}
        deanOptions={deanOptions}
        assigning={assigning}
        deletingId={deletingId}
        onOpenAssign={openAssign}
        onAssignDean={handleAssignDean}
        onCancelAssign={() => setSelectedSchool(null)}
        onDelete={(id) =>
          setPendingDelete(schools.find((s) => s.id === id) ?? null)
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
        title="Delete School"
        description={`"${pendingDelete?.name}" and all its data will be permanently removed.`}
        confirmLabel="Delete School"
        loading={!!deletingId}
        onConfirm={confirmDeleteSchool}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}