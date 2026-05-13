"use client";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  School,
  Briefcase,
} from "lucide-react";

import DashboardOverview from "./modules/AdminDashboard";

import UserManagement from "./modules/UserManagement";

import StudentManagement from "./modules/StudentManagement";

import DepartmentManagement from "./modules/DepartmentManagement";

import SchoolManagement from "./modules/SchoolManagement";

import FacultyManagement from "./modules/FacultyManagement";

import OfficeManagement from "./modules/OfficeManagement";



export type TabKey =
  | "dashboard"
  | "users"
  | "students"
  | "departments"
  | "schools"
  | "faculties"
  | "offices";
  



export const tabs = [

  // DASHBOARD

  {
    key: "dashboard" as TabKey,

    label: "Dashboard",

    icon: LayoutDashboard,

    component: <DashboardOverview />,
  },



  // USERS

  {
    key: "users" as TabKey,

    label: "Users",

    icon: Users,

    component: <UserManagement />,

    action: {

      href: "/admin/add-role",

      label: "Add Role",

      color:
        "bg-indigo-600 hover:bg-indigo-700",

    },
  },



  // STUDENTS

  {
    key: "students" as TabKey,

    label: "Students",

    icon: GraduationCap,

    component: <StudentManagement />,
  },



  // FACULTIES

  {
    key: "faculties" as TabKey,

    label: "Faculties",

    icon: Building2,

    component: <FacultyManagement />,

    action: {

      href:
        "/admin/manage-faculty/add-faculty",

      label: "Add Faculty",

      color:
        "bg-green-600 hover:bg-green-700",

    },
  },



  // DEPARTMENTS

  {
    key: "departments" as TabKey,

    label: "Departments",

    icon: Building2,

    component: <DepartmentManagement />,
  },



  // SCHOOLS

  {
    key: "schools" as TabKey,

    label: "Schools",

    icon: School,

    component: <SchoolManagement />,

    action: {

      href:
        "/admin/manage-faculty/add-school",

      label: "Add School",

      color:
        "bg-blue-600 hover:bg-blue-700",

    },
  },



  // OFFICES

  {
    key: "offices" as TabKey,

    label: "Offices",

    icon: Briefcase,

    component: <OfficeManagement />,

    action: {

      href: "/admin/offices/add",

      label: "Add Office",

      color:
        "bg-pink-600 hover:bg-pink-700",

    },
  },

];