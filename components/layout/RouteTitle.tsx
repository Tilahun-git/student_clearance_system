"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/auth/login": "Login",
  "/auth/forgot-password": "Forgot Password",
  "/auth/change-password": "Change Password",
  "/auth/reset-password": "Reset Password",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/create-user": "Create User",
  "/admin/create-student-account": "Create Student Account",
  "/admin/manage-faculty/add-department": "Add Department",
  "/admin/manage-faculty/add-school": "Add School",
  "/admin/offices/add": "Add Office",
  "/advisor/dashboard": "Advisor Dashboard",
  "/cafeteria/dashboard": "Cafeteria Dashboard",
  "/campus-police/dashboard": "Campus Police Dashboard",
  "/contact": "Contact",
  "/department-head/dashboard": "Department Head Dashboard",
  "/dormitory/dashboard": "Dormitory Dashboard",
  "/library/dashboard": "Library Dashboard",
  "/registrar/dashboard": "Registrar Dashboard",
  "/registrar/register-student": "Register Student",
  "/registrar/student-certificates": "Student Certificates",
  "/school-dean/dashboard": "School Dean Dashboard",
  "/student-dean/dashboard": "Student Dean Dashboard",
  "/student/dashboard": "Student Dashboard",
  "/student/clearance/certificate": "Clearance Certificate",
  "/unauthorized": "Unauthorized",
};

function getFallbackTitle(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return "Home";

  const role = segments[0];
  const roleLabels: Record<string, string> = {
    admin: "Admin",
    advisor: "Advisor",
    cafeteria: "Cafeteria",
    "campus-police": "Campus Police",
    "department-head": "Department Head",
    dormitory: "Dormitory",
    library: "Library",
    registrar: "Registrar",
    "school-dean": "School Dean",
    "student-dean": "Student Dean",
    student: "Student",
  };

  if (segments.length === 1 && roleLabels[role]) {
    return roleLabels[role];
  }

  if (segments.length >= 2 && roleLabels[role]) {
    return roleLabels[role];
  }

  return "Student Clearance System";
}

export default function RouteTitle() {
  const pathname = usePathname();

  useEffect(() => {
    const title = routeTitles[pathname] ?? getFallbackTitle(pathname);
    document.title = `${title} | Student Clearance System`;
  }, [pathname]);

  return null;
}
