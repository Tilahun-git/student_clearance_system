"use client";

import { useState } from "react";
import {
  Users,
  GraduationCap,
  Building2,
  School,
  Menu,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import UserManagement from "./modules/UserManagement";
import StudentManagement from "./modules/StudentManagement";
import DepartmentManagement from "./modules/DepartmentManagement";
import SchoolManagement from "./modules/SchoolManagement";

// ✅ add faculty tab
type Tab = "users" | "students" | "departments" | "schools" | "faculties";

function SidebarItem({
  icon,
  label,
  active,
  open,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 relative
        ${
          active
            ? "bg-indigo-50 text-indigo-700 font-medium"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" />
      )}

      <div className="flex items-center justify-center w-6">
        {icon}
      </div>

      {open && <span className="text-sm truncate">{label}</span>}
    </button>
  );
}

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-blue-50 text-slate-900">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`h-screen fixed left-0 top-0 z-50
        bg-blue-400 border-r border-slate-200 shadow-sm
        transition-all duration-300
        ${open ? "w-64" : "w-20"}`}
      >
        <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200">
          {open && (
            <Image
              src="/wldu_logo.jpg"
              alt="University Logo"
              width={45}
              height={45}
              className="rounded-md"
            />
          )}

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-1 text-sm">

          <SidebarItem
            icon={<Users size={18} />}
            label="Users"
            active={activeTab === "users"}
            open={open}
            onClick={() => setActiveTab("users")}
          />

          <SidebarItem
            icon={<GraduationCap size={18} />}
            label="Students"
            active={activeTab === "students"}
            open={open}
            onClick={() => setActiveTab("students")}
          />

          {/* ✅ NEW FACULTY TAB */}
          <SidebarItem
            icon={<Building2 size={18} />}
            label="Faculties"
            active={activeTab === "faculties"}
            open={open}
            onClick={() => setActiveTab("faculties")}
          />

          <SidebarItem
            icon={<Building2 size={18} />}
            label="Departments"
            active={activeTab === "departments"}
            open={open}
            onClick={() => setActiveTab("departments")}
          />

          <SidebarItem
            icon={<School size={18} />}
            label="Schools"
            active={activeTab === "schools"}
            open={open}
            onClick={() => setActiveTab("schools")}
          />

        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <main
        className={`flex-1 transition-all duration-300
        ${open ? "ml-64" : "ml-20"}`}
      >
        <div className="p-6">

          {/* ===== HEADER ===== */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Admin Dashboard
              </h2>
              <p className="text-sm text-slate-500">
                Manage system users, students, departments, schools and faculties
              </p>
            </div>

            {/* ✅ USERS → Add Role */}
            {activeTab === "users" && (
              <Link
                href="/admin/add-role"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition"
              >
                <PlusCircle size={16} />
                Add Role
              </Link>
            )}

            {/* ✅ FACULTY → Add Faculty */}
            {activeTab === "faculties" && (
              <Link
                href="/admin/manage-faculty/add-faculty"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700
                text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition"
              >
                <PlusCircle size={16} />
                Add Faculty
              </Link>
            )}

            {/* ✅ SCHOOL → Add School */}
            {activeTab === "schools" && (
              <Link
                href="/admin/manage-faculty/add-school"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition"
              >
                <PlusCircle size={16} />
                Add School
              </Link>
            )}
          </div>

          {/* ===== CONTENT CARD ===== */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">

            {activeTab === "users" && <UserManagement />}
            {activeTab === "students" && <StudentManagement />}
            {activeTab === "departments" && <DepartmentManagement />}
            {activeTab === "schools" && <SchoolManagement />}

            {/* Optional placeholder */}
            {activeTab === "faculties" && (
              <div className="text-slate-500 text-sm text-center py-10">
                Faculty management coming soon...
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}