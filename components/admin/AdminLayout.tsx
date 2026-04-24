"use client";

import { useState } from "react";
import {
  Users,
  GraduationCap,
  Building2,
  School,
  Menu,
} from "lucide-react";
import Image from "next/image"
import logo from "../public/wldu_logo.jpg"


import UserManagement from "./modules/UserManagement";
import StudentManagement from "./modules/StudentManagement";
import DepartmentManagement from "./modules/DepartmentManagement";
import SchoolManagement from "./modules/SchoolManagement";

type Tab = "users" | "students" | "departments" | "schools";


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

      {open && (
        <span className="text-sm truncate">
          {label}
        </span>
      )}
    </button>
  );
}

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-blue-50 text-slate-900">

      <aside
        className={`h-screen fixed left-0 top-0 z-50
        bg-blue-400  border-r border-slate-200 shadow-sm
        transition-all duration-300
        ${open ? "w-64" : "w-20"}`}
      >

        <div className="h-16 flex items-center bg-blue-400 justify-between px-3 border-b border-slate-200">
          {open && (
             <Image
                        src="/wldu_logo.jpg"                        
                        alt="University Logo"
                        width={45}
                        height={45}
                        style={{height:"auto"}}
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

      <main
        className={`flex-1 transition-all duration-300
        ${open ? "ml-64" : "ml-20"}`}
      >
        <div className="p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Admin Dashboard
            </h2>
            <p className="text-sm text-slate-500">
              Manage system users, students, departments and schools
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            {activeTab === "users" && <UserManagement />}
            {activeTab === "students" && <StudentManagement />}
            {activeTab === "departments" && <DepartmentManagement />}
            {activeTab === "schools" && <SchoolManagement />}
          </div>

        </div>
      </main>
    </div>
  );
}