export const roleRedirect: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  STUDENT: "/student/dashboard",
  ADVISOR: "/advisor/dashboard",
  DEPARTMENT_HEAD: "/department-head/dashboard",
  REGISTRAR: "/registrar/dashboard",
  LIBRARY: "/library/dashboard",
  FINANCE: "/finance",
  DORMITORY: "/dormitory",
  CAFETERIA: "/cafeteria",
  STUDENT_DEAN: "/student-dean",
  FACULTY_DEAN: "/faculty-dean",
};
export const ROLE_TYPES = [
  "STUDENT",
  "ADVISOR",
  "DEPARTMENT_HEAD",
  "FINANCE",
  "LIBRARY",
  "REGISTRAR",
  "ADMIN",
  "SCHOOL_DEAN",
  "CAFETERIA",
  "DORMITORY",
  "STUDENT_DEAN",
] as const;

export type RoleTypeFrontend = typeof ROLE_TYPES[number];
