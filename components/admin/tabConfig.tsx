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
import OfficeManagement from "./modules/OfficeManagement";

export type TabKey =
  | "dashboard"
  | "users"
  | "students"
  | "departments"
  | "schools"
  | "offices";

export const tabs = [
  {
    key: "dashboard" as TabKey,
    label: "Dashboard",
    icon: LayoutDashboard,
    component: <DashboardOverview />,
  },
  {
    key: "users" as TabKey,
    label: "Users",
    icon: Users,
    component: <UserManagement />,
    action: {
      href: "/admin/create-user",
      label: "Add User",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
  },
  {
    key: "students" as TabKey,
    label: "Students",
    icon: GraduationCap,
    component: <StudentManagement />,
  },
  {
    key: "departments" as TabKey,
    label: "Departments",
    icon: Building2,
    component: <DepartmentManagement />,
    action: {
      href: "/admin/manage-faculty/add-department",
      label: "Add Department",
      color: "bg-purple-600 hover:bg-purple-700",
    },
  },
  {
    key: "schools" as TabKey,
    label: "Schools",
    icon: School,
    component: <SchoolManagement />,
    action: {
      href: "/admin/manage-faculty/add-school",
      label: "Add School",
      color: "bg-blue-600 hover:bg-blue-700",
    },
  },
  {
    key: "offices" as TabKey,
    label: "Offices",
    icon: Briefcase,
    component: <OfficeManagement />,
    action: {
      href: "/admin/offices/add",
      label: "Add Office",
      color: "bg-pink-600 hover:bg-pink-700",
    },
  },
];
