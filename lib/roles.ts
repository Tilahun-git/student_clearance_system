import { RoleType } from "@prisma/client";
export const routes = [
  { prefix: "/student-dean",    role: "STUDENT_DEAN" as RoleType,    redirect: "/student-dean/dashboard" },
  { prefix: "/school-dean",    role: "SCHOOL_DEAN" as RoleType,     redirect: "/school-dean/dashboard" },
  { prefix: "/department-head", role: "DEPARTMENT_HEAD" as RoleType, redirect: "/department-head/dashboard" },
  { prefix: "/campus-police",   role: "CAMPUS_POLICE" as RoleType,   redirect: "/campus-police/dashboard" },
  { prefix: "/dormitory",       role: "DORMITORY" as RoleType,       redirect: "/dormitory/dashboard" },
  { prefix: "/cafeteria",       role: "CAFETERIA" as RoleType,       redirect: "/cafeteria/dashboard" },
  { prefix: "/advisor",         role: "ADVISOR" as RoleType,         redirect: "/advisor/dashboard" },
  { prefix: "/student",         role: "STUDENT" as RoleType,         redirect: "/student/dashboard" },
  { prefix: "/admin",           role: "ADMIN" as RoleType,           redirect: "/admin/dashboard" },
  { prefix: "/registrar",       role: "REGISTRAR" as RoleType,       redirect: "/registrar/dashboard" },
  { prefix: "/library",         role: "LIBRARY" as RoleType,         redirect: "/library/dashboard" },
] as const;

export type RoleRoute = (typeof routes)[number];

export function getRedirectByRole(role: string): string {
  const match = routes.find((r) => r.role === role.toUpperCase());
  return match?.redirect ?? "/unauthorized";
}

export function hasRole(
  user: { roles?: { role: { name: RoleType } }[] },
  roleName: RoleType,
): boolean {
  return user.roles?.some((r) => r.role.name === roleName) ?? false;
}

export const ROLE_TYPES: RoleType[] = [
  "STUDENT",
  "ADVISOR",
  "DEPARTMENT_HEAD",
  "SCHOOL_DEAN",
  "LIBRARY",
  "REGISTRAR",
  "ADMIN",
  "CAFETERIA",
  "DORMITORY",
  "STUDENT_DEAN",
  "CAMPUS_POLICE",
];

