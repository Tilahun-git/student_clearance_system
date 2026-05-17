"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import PageHeader from "../PageHeader";
import { fetchStudents } from "@/lib/api/admin";
import StudentTable, { type StudentRow } from "@/components/tables/StudentTable";
import Pagination from "@/components/UI/Pagination";
import { usePagination } from "@/hooks/usePagination";

const PAGE_SIZE = 10;

export default function StudentManagement() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetchStudents()
      .then((data) => setStudents(data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()),
  );

  const { page, totalPages, totalItems, paged, goTo } = usePagination(filtered, PAGE_SIZE);

  return (
    <div>
      <PageHeader
        icon={GraduationCap}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        title="Student Management"
        subtitle="View and manage student accounts"
        badge={
          !loading && students.length > 0 ? (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {students.length} total
            </span>
          ) : undefined
        }
      />

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); goTo(1); }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      <StudentTable students={paged} loading={loading} search={search} />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={goTo}
      />
    </div>
  );
}
